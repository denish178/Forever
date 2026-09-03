import userModel from "../models/userModel.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const addToWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const userData = await userModel.findById(userId);
    const wishlistData = { ...(userData.wishlistData || {}), [itemId]: true };

    await userModel.findByIdAndUpdate(userId, { wishlistData });

    return sendSuccess(res, { message: "Added To Wishlist" });
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const userData = await userModel.findById(userId);
    const wishlistData = { ...(userData.wishlistData || {}) };
    delete wishlistData[itemId];

    await userModel.findByIdAndUpdate(userId, { wishlistData });

    return sendSuccess(res, { message: "Removed From Wishlist" });
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);

    return sendSuccess(res, { wishlistData: userData.wishlistData || {} });
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

export { addToWishlist, removeFromWishlist, getUserWishlist };
