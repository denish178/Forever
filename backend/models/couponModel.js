import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ["percent", "flat"], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
});

const couponModel =
  mongoose.models.coupon || mongoose.model("coupon", couponSchema);

export default couponModel;
