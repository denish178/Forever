import jwt from "jsonwebtoken";
import { sendError } from "../utils/apiResponse.js";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return sendError(res, "Not Authorized Login Again", 401);
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return sendError(res, "Not Authorized Login Again", 401);
    }

    next();
  } catch (error) {
    console.log(error);
    return sendError(res, "Invalid or expired token", 401);
  }
};

export default adminAuth;
