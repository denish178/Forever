import couponModel from "../models/couponModel.js";

export const calculateSubtotal = (items = []) =>
  items.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity || 1),
    0,
  );

export const calculateDiscountAmount = (coupon, subtotal) => {
  if (coupon.discountType === "flat") {
    return Math.min(coupon.discountValue, subtotal);
  }

  let discount = (subtotal * coupon.discountValue) / 100;

  if (coupon.maxDiscount > 0) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  return Math.min(discount, subtotal);
};

export const validateCouponForOrder = async (code, subtotal) => {
  if (!code || !String(code).trim()) {
    return { discount: 0, coupon: null };
  }

  const coupon = await couponModel.findOne({
    code: String(code).trim().toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error("This coupon has expired");
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new Error(
      `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
    );
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This coupon has reached its usage limit");
  }

  const discount = calculateDiscountAmount(coupon, subtotal);

  if (discount <= 0) {
    throw new Error("This coupon cannot be applied to your order");
  }

  return { coupon, discount };
};

export const buildOrderAmount = (subtotal, discount, deliveryCharge = 10) =>
  Math.max(0, subtotal - discount + deliveryCharge);

export const incrementCouponUsage = async (couponId) => {
  if (!couponId) return;

  await couponModel.findByIdAndUpdate(couponId, {
    $inc: { usedCount: 1 },
  });
};
