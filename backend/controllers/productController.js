import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

const isCloudinaryImage = (image) =>
  typeof image === "string" &&
  image.startsWith("http") &&
  image.includes("res.cloudinary.com");

const getCloudinaryPublicId = (url) => {
  try {
    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex === -1) return null;

    let pathAfterUpload = urlParts.slice(uploadIndex + 1);
    if (pathAfterUpload[0]?.match(/^v\d+$/)) {
      pathAfterUpload = pathAfterUpload.slice(1);
    }

    const publicIdWithExt = pathAfterUpload.join("/");
    return publicIdWithExt.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

// function for add product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now(),
    };

    console.log(productData);

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for list product
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const product = await productModel.findById(id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    for (const image of product.image) {
      if (!isCloudinaryImage(image)) continue;

      const publicId = getCloudinaryPublicId(image);
      if (!publicId) continue;

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Cloudinary delete failed:", publicId, error.message);
      }
    }

    await productModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for updating product
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      existingImages,
    } = req.body;
    const { id } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    let keptImages = [];
    try {
      keptImages = JSON.parse(existingImages || "[]");
    } catch {
      keptImages = [...product.image];
    }

    // Only allow images that originally belonged to this product
    keptImages = keptImages.filter((img) => product.image.includes(img));

    const removedImages = product.image.filter((img) => !keptImages.includes(img));

    for (const image of removedImages) {
      if (!isCloudinaryImage(image)) continue;

      const publicId = getCloudinaryPublicId(image);
      if (!publicId) continue;

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Cloudinary delete failed:", publicId, error.message);
      }
    }

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: [...keptImages, ...imagesUrl].slice(0, 4),
    };

    await productModel.findByIdAndUpdate(id, productData);

    res.json({ success: true, message: "Product Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  updateProduct,
};
