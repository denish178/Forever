import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const addToWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return sendError(res, "User not found", 404);
    }

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

    if (!userData) {
      return sendError(res, "User not found", 404);
    }

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

    if (!userData) {
      return sendError(res, "User not found", 404);
    }

    const rawWishlist = userData.wishlistData || {};
    const wishlistIds = Object.keys(rawWishlist).filter((id) => rawWishlist[id]);

    if (wishlistIds.length === 0) {
      return sendSuccess(res, { wishlistData: {} });
    }

    const existingProducts = await productModel
      .find({ _id: { $in: wishlistIds } })
      .select("_id");

    const validIds = new Set(
      existingProducts.map((product) => product._id.toString()),
    );

    const wishlistData = {};
    for (const id of wishlistIds) {
      if (validIds.has(id)) {
        wishlistData[id] = true;
      }
    }

    if (Object.keys(wishlistData).length !== wishlistIds.length) {
      await userModel.findByIdAndUpdate(userId, { wishlistData });
    }

    return sendSuccess(res, { wishlistData });
  } catch (error) {
    console.log(error);
    return sendError(res, error.message, 500);
  }
};

export { addToWishlist, removeFromWishlist, getUserWishlist };
