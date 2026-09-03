import jwt from "jsonwebtoken";
import { sendError } from "../utils/apiResponse.js";

const authUser = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return sendError(res, "Not Authorized Login Again", 401);
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    return sendError(res, "Invalid or expired token", 401);
  }
};

export default authUser;
