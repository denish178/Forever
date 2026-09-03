import express from "express";
import {
  addReview,
  getProductReviews,
  checkReviewEligibility,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authUser, addReview);
reviewRouter.post("/product", getProductReviews);
reviewRouter.post("/eligibility", authUser, checkReviewEligibility);
reviewRouter.post("/update", authUser, updateReview);
reviewRouter.post("/remove", authUser, deleteReview);

export default reviewRouter;
