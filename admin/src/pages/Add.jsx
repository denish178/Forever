import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const MAX_IMAGES = 4;
  const imageSlots = [
    { id: "image1", image: image1, setImage: setImage1 },
    { id: "image2", image: image2, setImage: setImage2 },
    { id: "image3", image: image3, setImage: setImage3 },
    { id: "image4", image: image4, setImage: setImage4 },
  ];
  const selectedImages = imageSlots.filter((slot) => slot.image);

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

    if (selectedImages.length === 0) {
      toast.error("Please upload at least one product image");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Men");
    setSubCategory("Topwear");
    setBestseller(false);
    setSizes([]);
    setImage1(false);
    setImage2(false);
    setImage3(false);
    setImage4(false);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
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

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full max-w-4xl items-start gap-5"
    >
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-gray-700">Product Images</p>
          <span className="text-sm text-gray-500">
            {selectedImages.length}/{MAX_IMAGES} selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {imageSlots.map((slot, index) => (
            <div key={slot.id} className="relative">
              <label htmlFor={slot.id} className="block cursor-pointer">
                <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:border-gray-500">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      slot.image
                        ? URL.createObjectURL(slot.image)
                        : assets.upload_area
                    }
                    alt=""
                  />
                </div>
                <input
                  onChange={(e) => slot.setImage(e.target.files[0])}
                  type="file"
                  id={slot.id}
                  accept="image/*"
                  hidden
                />
              </label>

              {slot.image && (
                <button
                  type="button"
                  onClick={() => slot.setImage(false)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold"
                >
                  X
                </button>
              )}

              <p className="text-xs text-gray-400 mt-1 text-center">
                Image {index + 1}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2 font-medium text-gray-700">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-gray-500"
          type="text"
          placeholder="Type here"
        />
      </div>

      <div className="w-full">
        <p className="mb-2 font-medium text-gray-700">Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          rows="5"
          className="w-full border border-gray-300 rounded px-3 py-2 outline-none resize-none focus:border-gray-500"
          placeholder="Write content here"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full">
        <div className="w-full sm:w-1/3">
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

        <div className="w-full sm:w-1/3">
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

        <div className="w-full sm:w-1/3">
          <p className="mb-2 font-medium text-gray-700">Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-gray-500"
            type="number"
            min="1"
            placeholder="25"
          />
        </div>
      </div>

      <div>
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

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
        />
        <span className="font-medium text-gray-700">Add to Bestseller</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="px-8 py-3 bg-black text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "ADDING..." : "ADD PRODUCT"}
      </button>
    </form>
  );
};

export default Add;
