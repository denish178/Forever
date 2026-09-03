import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { imageMap } from "../assets/imageMap";
import WishlistButton from "../components/WishlistButton";

const Wishlist = () => {
  const { products, currency, wishlistItems, toggleWishlist } =
    useContext(ShopContext);
  const [wishlistProducts, setWishlistProducts] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const items = products.filter((product) => wishlistItems[product._id]);
      setWishlistProducts(items);
    }
  }, [products, wishlistItems]);

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"MY"} text2={"WISHLIST"} />
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-gray-500 text-sm py-10">
          <p className="mb-4">Your wishlist is empty.</p>
          <Link to="/collection" className="underline text-gray-700">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div key={product._id} className="relative text-gray-700">
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton
                  active={true}
                  onClick={() => toggleWishlist(product._id)}
                />
              </div>

              <Link
                to={`/product/${product._id}`}
                onClick={() => scrollTo(0, 0)}
                className="block"
              >
                <div className="overflow-hidden">
                  <img
                    className="hover:scale-110 transition ease-in-out w-full"
                    src={
                      product.image[0]?.startsWith("http")
                        ? product.image[0]
                        : imageMap[product.image[0]]
                    }
                    alt={product.name}
                  />
                </div>
                <p className="pt-3 pb-1 text-sm">{product.name}</p>
                <p className="text-sm font-medium">
                  {currency}
                  {product.price}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
