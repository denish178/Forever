import express from "express";
import authUser from "../middleware/auth.js";
import { validateCoupon } from "../controllers/couponController.js";

const couponRouter = express.Router();

couponRouter.post("/validate", authUser, validateCoupon);

export default couponRouter;
