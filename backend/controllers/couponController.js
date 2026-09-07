import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { validateCouponForOrder } from "../utils/couponService.js";

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !String(code).trim()) {
      return sendError(res, "Coupon code is required", 400);
    }

    const orderSubtotal = Number(subtotal);

    if (!orderSubtotal || orderSubtotal <= 0) {
      return sendError(res, "A valid subtotal is required", 400);
    }

    const { coupon, discount } = await validateCouponForOrder(code, orderSubtotal);

    return sendSuccess(res, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      message:
        coupon.discountType === "percent"
          ? `${coupon.discountValue}% discount applied`
          : `₹${discount} discount applied`,
    });
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export { validateCoupon };
