import userModel from "../models/userModel.js";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
} from "./sendEmail.js";

const getOrderRecipientEmail = async (order) => {
  const user = await userModel.findById(order.userId).select("email");
  return user?.email || order.address?.email || null;
};

export const notifyOrderPlaced = async (order) => {
  try {
    const email = await getOrderRecipientEmail(order);
    if (!email) return;

    await sendOrderConfirmationEmail(email, order);
  } catch (error) {
    console.log("Order confirmation email failed:", error.message);
  }
};

export const notifyOrderStatusUpdated = async (order, status) => {
  try {
    const email = await getOrderRecipientEmail(order);
    if (!email) return;

    await sendOrderStatusEmail(email, order, status);
  } catch (error) {
    console.log("Order status email failed:", error.message);
  }
};
