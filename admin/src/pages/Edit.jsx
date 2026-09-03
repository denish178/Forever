import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { imageMap } from "../assets/imageMap";
import { toast } from "react-toastify";

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);

  const [existingImages, setExistingImages] = useState([]);

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const MAX_IMAGES = 4;
  const newImages = [image1, image2, image3, image4].filter(Boolean);
  const totalImages = existingImages.length + newImages.length;
  const remainingSlots = MAX_IMAGES - existingImages.length;

  const removeExistingImage = (imageToRemove) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageToRemove));
  };

  const newImageSlots = [
    { image: image1, setImage: setImage1 },
    { image: image2, setImage: setImage2 },
    { image: image3, setImage: setImage3 },
    { image: image4, setImage: setImage4 },
  ].slice(0, remainingSlots);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return false;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return false;
    }

    if (sizes.length === 0) {
      toast.error("Please select at least one size");
      return false;
    }

    return true;
  };

  // Fetch single product
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response = await axios.post(backendUrl + "/api/product/single", {
        productId: id,
      });

      if (response.data.success && response.data.product) {
        setProduct(response.data.product);
      } else {
        setProduct(null);
        setLoadError(response.data.message || "Product not found");
        toast.error(response.data.message || "Product not found");
      }
    } catch (error) {
      console.log(error);
      setProduct(null);
      setLoadError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update product
  const updateProduct = async () => {
    if (!validateForm()) return;

    if (totalImages > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed per product`);
      return;
    }

    if (totalImages === 0) {
      toast.error("Please keep at least one product image");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("existingImages", JSON.stringify(existingImages));

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.patch(
        backendUrl + `/api/product/${id}`,
        formData,
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        await fetchProduct();
        navigate("/list");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch product when page loads
  useEffect(() => {
    setProduct(null);
    fetchProduct();
  }, [id]);

  // Populate form when product is fetched
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setCategory(product.category);
      setSubCategory(product.subCategory);
      setSizes(product.sizes);
      setBestseller(product.bestseller);
      setExistingImages(product.image);
    }
  }, [product]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 max-w-4xl">
        <h2 className="text-2xl font-semibold">Edit Product</h2>
        <button
          type="button"
          onClick={() => navigate("/list")}
          className="text-sm text-gray-600 hover:text-black underline"
        >
          Back to List
        </button>
      </div>

      {loading && (
        <div className="bg-white border border-gray-200 p-8 rounded-lg max-w-4xl text-center text-gray-500">
          Loading product...
        </div>
      )}

      {!loading && loadError && (
        <div className="bg-white border border-red-200 p-8 rounded-lg max-w-4xl text-center">
          <p className="text-red-500 mb-4">{loadError}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchProduct}
              className="bg-black text-white px-5 py-2 rounded text-sm"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => navigate("/list")}
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded text-sm"
            >
              Back to List
            </button>
          </div>
        </div>
      )}

      {!loading && product && (
        <div className="bg-white border border-gray-200 p-6 rounded-lg max-w-4xl">
          {/* Product Name */}
          <div className="mb-5">
            <p className="mb-2 font-medium text-gray-700">Product Name</p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-gray-500"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="mb-2 font-medium text-gray-700">Description</p>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none resize-none focus:border-gray-500"
            />
          </div>

          {/* Price */}
          <div className="mb-5">
            <p className="mb-2 font-medium text-gray-700">Price</p>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full sm:w-40 border border-gray-300 rounded px-3 py-2 outline-none focus:border-gray-500"
            />
          </div>

          {/* Category & Sub Category */}
          <div className="flex flex-col sm:flex-row gap-5 mb-5">
            {/* Category */}
            <div className="w-full sm:w-1/2">
              <p className="mb-2 font-medium text-gray-700">Category</p>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none bg-white focus:border-gray-500"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            {/* Sub Category */}
            <div className="w-full sm:w-1/2">
              <p className="mb-2 font-medium text-gray-700">Sub Category</p>

              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none bg-white focus:border-gray-500"
              >
                <option value="Topwear">Topwear</option>
                <option value="Bottomwear">Bottomwear</option>
                <option value="Winterwear">Winterwear</option>
              </select>
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-6">
            <p className="mb-3 font-medium text-gray-700">Sizes</p>

            <div className="flex gap-2 flex-wrap">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setSizes((prev) =>
                      prev.includes(size)
                        ? prev.filter((item) => item !== size)
                        : [...prev, size],
                    )
                  }
                  className={`min-w-10 px-4 py-2 border rounded ${
                    sizes.includes(size)
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Bestseller */}
          <div className="mb-7">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bestseller}
                onChange={() => setBestseller((prev) => !prev)}
                className="w-4 h-4"
              />

              <span className="font-medium text-gray-700">
                Add to Bestseller
              </span>
            </label>
          </div>

          {/* Existing Product Images */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-gray-700">Existing Product Images</p>
              <span
                className={`text-sm ${
                  totalImages > MAX_IMAGES ? "text-red-500" : "text-gray-500"
                }`}
              >
                {totalImages}/{MAX_IMAGES} images
              </span>
            </div>

            {existingImages.length === 0 ? (
              <p className="text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg p-4 text-center">
                No existing images. Add new images below.
              </p>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {existingImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-28 h-28 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm"
                  >
                    <img
                      src={image.startsWith("http") ? image : imageMap[image]}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Saved
                    </span>

                    <button
                      type="button"
                      onClick={() => removeExistingImage(image)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600"
                      title="Remove image"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Product Images */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-gray-700">Add New Images</p>
              <span className="text-sm text-gray-500">
                {remainingSlots > 0
                  ? `${remainingSlots} slot${remainingSlots > 1 ? "s" : ""} left`
                  : "No slots left"}
              </span>
            </div>

            {remainingSlots === 0 ? (
              <p className="text-sm text-amber-600 border border-amber-200 bg-amber-50 rounded-lg p-4">
                Maximum image limit reached. Remove an existing image to add a new one.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {newImageSlots.map((slot, index) => (
                  <div key={index} className="relative">
                    <label className="block">
                      <div className="w-full aspect-square border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden bg-blue-50/40 hover:border-blue-400">
                        {slot.image ? (
                          <img
                            src={URL.createObjectURL(slot.image)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-gray-400 text-center px-2">
                            Select Image {index + 1}
                          </span>
                        )}
                      </div>

                      {slot.image && (
                        <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => slot.setImage(e.target.files[0])}
                        className="hidden"
                      />
                    </label>

                    {slot.image && (
                      <button
                        type="button"
                        onClick={() => slot.setImage(false)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600"
                        title="Remove selected image"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={updateProduct}
              disabled={submitting}
              className="bg-black text-white px-8 py-3 rounded text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "UPDATING..." : "UPDATE PRODUCT"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/list")}
              disabled={submitting}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Edit;
