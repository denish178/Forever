import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

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
      return res.json({ success: false, message: "Product not found" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const hasPurchased = await userHasPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      return res.json({
        success: false,
        message: "You can only review products you have purchased",
      });
    }

    const reviewRating = Number(rating);
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      return res.json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (!comment || !comment.trim()) {
      return res.json({ success: false, message: "Review comment is required" });
    }

    const existingReview = await reviewModel.findOne({ productId, userId });

    if (existingReview) {
      await reviewModel.findByIdAndUpdate(existingReview._id, {
        rating: reviewRating,
        comment: comment.trim(),
        userName: user.name,
        date: Date.now(),
      });

      return res.json({ success: true, message: "Review updated" });
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

    res.json({ success: true, message: "Review added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
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

    res.json({
      success: true,
      reviews,
      reviewCount,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const checkReviewEligibility = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const canReview = await userHasPurchasedProduct(userId, productId);
    const existingReview = await reviewModel.findOne({ productId, userId });

    res.json({
      success: true,
      canReview,
      hasReview: Boolean(existingReview),
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { userId, reviewId, rating, comment } = req.body;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    if (String(review.userId) !== String(userId)) {
      return res.json({
        success: false,
        message: "You can only edit your own review",
      });
    }

    const reviewRating = Number(rating);
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      return res.json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (!comment || !comment.trim()) {
      return res.json({ success: false, message: "Review comment is required" });
    }

    await reviewModel.findByIdAndUpdate(reviewId, {
      rating: reviewRating,
      comment: comment.trim(),
      date: Date.now(),
    });

    res.json({ success: true, message: "Review updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { userId, reviewId } = req.body;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    if (String(review.userId) !== String(userId)) {
      return res.json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    await reviewModel.findByIdAndDelete(reviewId);

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addReview,
  getProductReviews,
  checkReviewEligibility,
  updateReview,
  deleteReview,
};
