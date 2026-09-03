import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const CATEGORIES = ["Men", "Women", "Kids"];
const SUB_CATEGORIES = ["Topwear", "Bottomwear", "Winterwear"];
const PRICE_RANGES = [
  { label: "All prices", value: "all" },
  { label: "Under $50", value: "under-50" },
  { label: "$50 – $100", value: "50-100" },
  { label: "Above $100", value: "above-100" },
];

const Collection = () => {
  const { products, search, setSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [priceRange, setPriceRange] = useState("all");

  const toggleCategory = (value) => {
    setCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const toggleSubCategory = (value) => {
    setSubCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const matchesPriceRange = (price) => {
    switch (priceRange) {
      case "under-50":
        return price < 50;
      case "50-100":
        return price >= 50 && price <= 100;
      case "above-100":
        return price > 100;
      default:
        return true;
    }
  };

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setPriceRange("all");
    setSortType("relevant");
    setSearch("");
  };

  const hasActiveFilters =
    category.length > 0 ||
    subCategory.length > 0 ||
    priceRange !== "all" ||
    search.trim().length > 0;

  useEffect(() => {
    let result = [...products];
    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.subCategory?.toLowerCase().includes(term),
      );
    }

    if (category.length > 0) {
      result = result.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      result = result.filter((item) => subCategory.includes(item.subCategory));
    }

    result = result.filter((item) => matchesPriceRange(item.price));

    if (sortType === "low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortType === "high-low") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilterProducts(result);
  }, [products, search, category, subCategory, sortType, priceRange]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      <div className="min-w-60">
        <div className="flex items-center justify-between my-2">
          <p
            onClick={() => setShowFilter(!showFilter)}
            className="text-xl flex items-center cursor-pointer gap-2"
          >
            FILTERS
            <img
              className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
              src={assets.dropdown_icon}
              alt=""
            />
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-gray-500 underline sm:hidden"
            >
              Clear
            </button>
          )}
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? "" : "hidden"} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {CATEGORIES.map((item) => (
              <label key={item} className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  checked={category.includes(item)}
                  onChange={() => toggleCategory(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? "" : "hidden"} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {SUB_CATEGORIES.map((item) => (
              <label key={item} className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  checked={subCategory.includes(item)}
                  onChange={() => toggleSubCategory(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 mb-5 ${showFilter ? "" : "hidden"} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">PRICE</p>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full border border-gray-300 text-sm px-2 py-1.5"
          >
            {PRICE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="hidden sm:block w-full border border-gray-300 text-sm py-2 hover:bg-gray-50"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4">
          <div>
            <Title text1={"ALL"} text2={"COLLECTIONS"} />
            <p className="text-sm text-gray-500 mt-1">
              {filterProducts.length}{" "}
              {filterProducts.length === 1 ? "product" : "products"}
              {search.trim() ? ` for "${search.trim()}"` : ""}
            </p>
          </div>

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2 py-1.5 self-start sm:self-auto"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {filterProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {filterProducts.map((item) => (
              <ProductItem
                key={item._id}
                name={item.name}
                id={item._id}
                price={item.price}
                image={item.image}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">No products found</p>
            <p className="text-sm mb-4">
              Try changing your search or filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="border border-gray-800 px-5 py-2 text-sm hover:bg-gray-50"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
