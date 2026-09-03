import React from "react";
import { assets } from "../assets/assets";

const StarRating = ({ rating = 0, size = "w-3.5" }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <img
          key={star}
          src={rating >= star ? assets.star_icon : assets.star_dull_icon}
          alt=""
          className={size}
        />
      ))}
    </div>
  );
};

export default StarRating;
