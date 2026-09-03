import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, orders] = await Promise.all([
      productModel.countDocuments(),
      orderModel.find({}).sort({ date: -1 }),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const pendingOrders = orders.filter(
      (order) => order.status !== "Delivered",
    ).length;

    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status || "Order Placed";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return sendSuccess(res, {
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        statusCounts,
      },
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export { getDashboardStats };
