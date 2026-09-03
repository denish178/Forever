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

  const removeExistingImage = (imageToRemove) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageToRemove));
  };

  // Fetch single product
  const fetchProduct = async () => {
    try {
      const response = await axios.post(backendUrl + "/api/product/single", {
        productId: id,
      });

      if (response.data.success) {
        setProduct(response.data.product);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update product
  const updateProduct = async () => {
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
      <h2 className="text-2xl font-semibold mb-6">Edit Product</h2>

      {product && (
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
            <p className="mb-3 font-medium text-gray-700">
              Existing Product Images
            </p>

            <div className="flex gap-3 flex-wrap">
              {existingImages.map((image, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 border border-gray-300 rounded overflow-hidden bg-gray-50"
                >
                  <img
                    src={image.startsWith("http") ? image : imageMap[image]}
                    alt=""
                    className="w-full h-full object-cover"
                  />

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
          </div>

          {/* New Product Images */}
          <div className="mb-8">
            <p className="mb-3 font-medium text-gray-700">Add New Images</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Image 1 */}
              <div>
                <label className="block">
                  <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-gray-500">
                    {image1 ? (
                      <img
                        src={URL.createObjectURL(image1)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-400 text-center px-2">
                        Select Image 1
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage1(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image 2 */}
              <div>
                <label className="block">
                  <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-gray-500">
                    {image2 ? (
                      <img
                        src={URL.createObjectURL(image2)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-400 text-center px-2">
                        Select Image 2
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage2(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image 3 */}
              <div>
                <label className="block">
                  <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-gray-500">
                    {image3 ? (
                      <img
                        src={URL.createObjectURL(image3)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-400 text-center px-2">
                        Select Image 3
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage3(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image 4 */}
              <div>
                <label className="block">
                  <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-gray-500">
                    {image4 ? (
                      <img
                        src={URL.createObjectURL(image4)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-400 text-center px-2">
                        Select Image 4
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage4(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Update Button */}
          <button
            type="button"
            onClick={updateProduct}
            disabled={submitting}
            className="bg-black text-white px-8 py-3 rounded text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "UPDATING..." : "UPDATE PRODUCT"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Edit;
