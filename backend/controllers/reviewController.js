import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const userHasPurchasedProduct = async (userId, productId) => {
  const orders = await orderModel.find({ userId });

  return orders.some((order) => {
    const hasProduct = order.items.some(
      (item) => String(item._id) === String(productId),
    );

    if (!hasProduct) return false;

    if (order.paymentMethod === "COD") {
      return true;
    }

    return order.payment === true;
  });
};

const addReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const hasPurchased = await userHasPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      return sendError(res, "You can only review products you have purchased", 403);
    }

    const reviewRating = Number(rating);
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    if (!comment || !comment.trim()) {
      return sendError(res, "Review comment is required", 400);
    }

    const existingReview = await reviewModel.findOne({ productId, userId });

    if (existingReview) {
      await reviewModel.findByIdAndUpdate(existingReview._id, {
        rating: reviewRating,
        comment: comment.trim(),
        userName: user.name,
        date: Date.now(),
      });

      return sendSuccess(res, { message: "Review updated" });
    }

    const review = new reviewModel({
      productId,
      userId,
      userName: user.name,
      rating: reviewRating,
      comment: comment.trim(),
      date: Date.now(),
    });

    await review.save();

    return sendSuccess(res, { message: "Review added" }, 201);
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.body;

    const reviews = await reviewModel.find({ productId }).sort({ date: -1 });
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    return sendSuccess(res, {
      reviews,
      reviewCount,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

const checkReviewEligibility = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const canReview = await userHasPurchasedProduct(userId, productId);
    const existingReview = await reviewModel.findOne({ productId, userId });

    return sendSuccess(res, {
      canReview,
      hasReview: Boolean(existingReview),
    });
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

const updateReview = async (req, res) => {
  try {
    const { userId, reviewId, rating, comment } = req.body;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return sendError(res, "Review not found", 404);
    }

    if (String(review.userId) !== String(userId)) {
      return sendError(res, "You can only edit your own review", 403);
    }

    const reviewRating = Number(rating);
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    if (!comment || !comment.trim()) {
      return sendError(res, "Review comment is required", 400);
    }

    await reviewModel.findByIdAndUpdate(reviewId, {
      rating: reviewRating,
      comment: comment.trim(),
      date: Date.now(),
    });

    return sendSuccess(res, { message: "Review updated" });
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

const deleteReview = async (req, res) => {
  try {
    const { userId, reviewId } = req.body;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return sendError(res, "Review not found", 404);
    }

    if (String(review.userId) !== String(userId)) {
      return sendError(res, "You can only delete your own review", 403);
    }

    await reviewModel.findByIdAndDelete(reviewId);

    return sendSuccess(res, { message: "Review deleted" });
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

export {
  addReview,
  getProductReviews,
  checkReviewEligibility,
  updateReview,
  deleteReview,
};
