import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setVisible(location.pathname.includes("collection"));
  }, [location]);

  const clearSearch = () => {
    setSearch("");
  };

  if (!showSearch || !visible) {
    return null;
  }

  return (
    <div className="border-t border-b bg-gray-50 text-center">
      <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none bg-inherit text-sm"
          type="text"
          placeholder="Search by name, category, or type..."
        />
        {search ? (
          <button
            type="button"
            onClick={clearSearch}
            className="text-xs text-gray-500 px-2"
            aria-label="Clear search"
          >
            Clear
          </button>
        ) : (
          <img className="w-4" src={assets.search_icon} alt="" />
        )}
      </div>
      <img
        onClick={() => {
          setShowSearch(false);
          setSearch("");
        }}
        className="inline w-3 cursor-pointer"
        src={assets.cross_icon}
        alt="Close search"
      />
    </div>
  );
};

export default SearchBar;
