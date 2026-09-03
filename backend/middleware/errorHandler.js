import { sendError } from "../utils/apiResponse.js";

const notFoundHandler = (req, res) => {
  return sendError(res, "Route not found", 404);
};

const errorHandler = (error, req, res, next) => {
  console.log(error);
  return sendError(res, error.message || "Internal server error", 500);
};

export { notFoundHandler, errorHandler };
