import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

// ================== CONFIG ==================
const currency = "inr";
const deliveryCharge = 10;

// ================== OPTIONAL GATEWAYS ==================

// Stripe (safe initialization)
let stripe = null;
if (
  process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.startsWith("replace")
) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Razorpay (safe initialization)
let razorpayInstance = null;
if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.startsWith("replace")
) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ================== COD ORDER ==================
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    return sendSuccess(res, { message: "Order Placed (COD)" }, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ================== STRIPE ORDER ==================
const placeOrderStripe = async (req, res) => {
  if (!stripe) {
    return sendError(res, "Stripe payments are disabled", 503);
  }

  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    });

    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charges" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    return sendSuccess(res, { session_url: session.url });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ================== VERIFY STRIPE ==================
const verifyStripe = async (req, res) => {
  try {
    const { orderId, success, userId } = req.body;

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      return sendSuccess(res, {});
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return sendError(res, "Payment cancelled", 400);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ================== RAZORPAY ORDER ==================
const placeOrderRazorpay = async (req, res) => {
  if (!razorpayInstance) {
    return sendError(res, "Razorpay payments are disabled", 503);
  }

  try {
    const { userId, items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    });

    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    const order = await razorpayInstance.orders.create(options);
    return sendSuccess(res, { order });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ================== VERIFY RAZORPAY ==================
const verifyRazorpay = async (req, res) => {
  if (!razorpayInstance) {
    return sendError(res, "Razorpay payments are disabled", 503);
  }

  try {
    const { userId, razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      return sendSuccess(res, { message: "Payment Successful" });
    } else {
      return sendError(res, "Payment Failed", 400);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ================== ADMIN & USER ==================
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    return sendSuccess(res, { orders });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    return sendSuccess(res, { orders });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const VALID_ORDER_STATUSES = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return sendError(res, "Order ID and status are required", 400);
    }

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return sendError(res, "Invalid order status", 400);
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    await orderModel.findByIdAndUpdate(orderId, { status });
    return sendSuccess(res, { message: "Status Updated" });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ================== EXPORTS ==================
export {
  verifyRazorpay,
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};
