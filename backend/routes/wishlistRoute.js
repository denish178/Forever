import express from "express";
import {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import authUser from "../middleware/auth.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/get", authUser, getUserWishlist);
wishlistRouter.post("/add", authUser, addToWishlist);
wishlistRouter.post("/remove", authUser, removeFromWishlist);

export default wishlistRouter;
