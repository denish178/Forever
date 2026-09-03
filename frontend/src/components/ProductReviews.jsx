import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import StarRating from "./StarRating";

const getUserIdFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch {
    return null;
  }
};

const ProductReviews = ({ productId, onReviewSummaryChange }) => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const currentUserId = token ? getUserIdFromToken(token) : null;

  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [updatingReviewId, setUpdatingReviewId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const checkEligibility = async () => {
    if (!token) {
      setCanReview(false);
      setHasReview(false);
      return;
    }

    try {
      setCheckingEligibility(true);

      const response = await axios.post(
        backendUrl + "/api/review/eligibility",
        { productId },
        { headers: { token } },
      );

      if (response.data.success) {
        setCanReview(response.data.canReview);
        setHasReview(response.data.hasReview);
      }
    } catch (error) {
      console.log(error);
      setCanReview(false);
      setHasReview(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await axios.post(backendUrl + "/api/review/product", {
        productId,
      });

      if (response.data.success) {
        setReviews(response.data.reviews);
        setReviewCount(response.data.reviewCount);
        setAverageRating(response.data.averageRating);
        onReviewSummaryChange?.({
          reviewCount: response.data.reviewCount,
          averageRating: response.data.averageRating,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please login to write a review");
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write your review");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        backendUrl + "/api/review/add",
        { productId, rating, comment },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setComment("");
        setRating(5);
        await loadReviews();
        await checkEligibility();
        setActiveTab("reviews");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  const saveEditedReview = async (reviewId) => {
    if (!editComment.trim()) {
      toast.error("Please write your review");
      return;
    }

    try {
      setUpdatingReviewId(reviewId);

      const response = await axios.post(
        backendUrl + "/api/review/update",
        { reviewId, rating: editRating, comment: editComment },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        cancelEditing();
        await loadReviews();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const removeReview = async (reviewId) => {
    const confirmed = window.confirm("Delete this review?");
    if (!confirmed) return;

    try {
      setDeletingReviewId(reviewId);

      const response = await axios.post(
        backendUrl + "/api/review/remove",
        { reviewId },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        if (editingReviewId === reviewId) {
          cancelEditing();
        }
        await loadReviews();
        await checkEligibility();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const showWriteForm = canReview && !hasReview;

  useEffect(() => {
    if (productId) {
      loadReviews();
      checkEligibility();
    }
  }, [productId, token]);

  return (
    <div className="mt-20">
      <div className="flex">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`border px-5 py-3 text-sm ${
            activeTab === "description" ? "font-bold bg-gray-50" : ""
          }`}
        >
          Description
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`border px-5 py-3 text-sm ${
            activeTab === "reviews" ? "font-bold bg-gray-50" : ""
          }`}
        >
          Reviews ({reviewCount})
        </button>
      </div>

      {activeTab === "description" ? (
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            An e-commerce website is an online platform that facilitates the
            buying and selling of products or services over the internet. It
            serves as a virtual marketplace where businesses and individuals can
            showcase their products, interact with customers, and conduct
            transactions without the need for a physical presence.
          </p>
          <p>
            E-commerce websites typically display products or services along
            with detailed descriptions, images, prices, and any available
            variations such as sizes and colors.
          </p>
        </div>
      ) : (
        <div className="border px-6 py-6 text-sm text-gray-600">
          <div className="flex items-center gap-3 mb-6">
            <StarRating rating={Math.round(averageRating)} />
            <p>
              {averageRating} out of 5 ({reviewCount} reviews)
            </p>
          </div>

          <form onSubmit={submitReview} className="mb-8 max-w-xl">
            <p className="font-medium text-gray-800 mb-2">Write a review</p>

            {!token ? (
              <p className="text-gray-500 mb-3">
                Please{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="underline text-gray-800"
                >
                  login
                </button>{" "}
                to write a review.
              </p>
            ) : checkingEligibility ? (
              <p className="text-gray-400 mb-3">Checking purchase eligibility...</p>
            ) : !canReview ? (
              <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-4 py-3 mb-3">
                Only customers who purchased this product can write a review.
              </p>
            ) : !showWriteForm ? (
              <p className="text-gray-500 mb-3">
                You already reviewed this product. Use Edit below to update your review.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`px-2 py-1 border rounded ${
                        rating >= star
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-gray-300"
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows="4"
                  placeholder="Share your experience with this product"
                  className="w-full border border-gray-300 rounded px-3 py-2 outline-none resize-none focus:border-gray-500"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-3 bg-black text-white px-6 py-2 text-sm disabled:opacity-50"
                >
                  {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
                </button>
              </>
            )}
          </form>

          {loading ? (
            <p className="text-gray-400">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet. Be the first to review.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {reviews.map((review) => {
                const isOwner =
                  currentUserId &&
                  String(review.userId) === String(currentUserId);
                const isEditing = editingReviewId === review._id;

                return (
                  <div key={review._id} className="border-b pb-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-medium text-gray-800">{review.userName}</p>
                      <div className="flex items-center gap-3">
                        {isOwner && !isEditing && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(review)}
                              className="text-xs text-gray-600 hover:text-black underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeReview(review._id)}
                              disabled={deletingReviewId === review._id}
                              className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-50"
                            >
                              {deletingReviewId === review._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(review.date).toDateString()}
                        </p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(star)}
                              className={`px-2 py-1 border rounded ${
                                editRating >= star
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-gray-600 border-gray-300"
                              }`}
                            >
                              {star}
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={editComment}
                          onChange={(event) => setEditComment(event.target.value)}
                          rows="4"
                          className="w-full border border-gray-300 rounded px-3 py-2 outline-none resize-none focus:border-gray-500"
                        />

                        <div className="flex gap-3 mt-3">
                          <button
                            type="button"
                            onClick={() => saveEditedReview(review._id)}
                            disabled={updatingReviewId === review._id}
                            className="bg-black text-white px-5 py-2 text-sm disabled:opacity-50"
                          >
                            {updatingReviewId === review._id
                              ? "SAVING..."
                              : "SAVE"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="border border-gray-300 text-gray-700 px-5 py-2 text-sm"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <StarRating rating={review.rating} />
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
