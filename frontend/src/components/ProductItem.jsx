import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { imageMap } from "../assets/imageMap";
import WishlistButton from "./WishlistButton";

const ProductItem = ({ id, image, name, price }) => {
  const { currency, isInWishlist, toggleWishlist } = useContext(ShopContext);

  return (
    <div className="relative text-gray-700">
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton
          active={isInWishlist(id)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(id);
          }}
        />
      </div>

      <Link
        onClick={() => scrollTo(0, 0)}
        className="cursor-pointer block"
        to={`/product/${id}`}
      >
      <div className=" overflow-hidden">
        <img
          className="hover:scale-110 transition ease-in-out"
          src={image[0]?.startsWith("http") ? image[0] : imageMap[image[0]]}
          alt={name}
        />
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className=" text-sm font-medium">
        {currency}
        {price}
      </p>
      </Link>
    </div>
  );
};

export default ProductItem;
