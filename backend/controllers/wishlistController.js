import userModel from "../models/userModel.js";

const addToWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const userData = await userModel.findById(userId);
    const wishlistData = { ...(userData.wishlistData || {}), [itemId]: true };

    await userModel.findByIdAndUpdate(userId, { wishlistData });

    res.json({ success: true, message: "Added To Wishlist" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const userData = await userModel.findById(userId);
    const wishlistData = { ...(userData.wishlistData || {}) };
    delete wishlistData[itemId];

    await userModel.findByIdAndUpdate(userId, { wishlistData });

    res.json({ success: true, message: "Removed From Wishlist" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);

    res.json({ success: true, wishlistData: userData.wishlistData || {} });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToWishlist, removeFromWishlist, getUserWishlist };
