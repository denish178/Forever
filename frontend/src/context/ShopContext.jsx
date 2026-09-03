import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } },
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } },
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setWishlistItems({});
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        clearSession();
        return;
      }
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getUserWishlist = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/wishlist/get",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        setWishlistItems(response.data.wishlistData || {});
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        clearSession();
        return;
      }
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const addToWishlist = async (itemId) => {
    const wishlistData = structuredClone(wishlistItems);
    wishlistData[itemId] = true;
    setWishlistItems(wishlistData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/wishlist/add",
          { itemId },
          { headers: { token } },
        );
        toast.success("Added to wishlist");
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    } else {
      toast.success("Added to wishlist");
    }
  };

  const removeFromWishlist = async (itemId) => {
    const wishlistData = structuredClone(wishlistItems);
    delete wishlistData[itemId];
    setWishlistItems(wishlistData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/wishlist/remove",
          { itemId },
          { headers: { token } },
        );
        toast.success("Removed from wishlist");
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    } else {
      toast.success("Removed from wishlist");
    }
  };

  const toggleWishlist = (itemId) => {
    if (wishlistItems[itemId]) {
      removeFromWishlist(itemId);
    } else {
      addToWishlist(itemId);
    }
  };

  const isInWishlist = (itemId) => Boolean(wishlistItems[itemId]);

  const getWishlistCount = () => {
    return Object.keys(wishlistItems).length;
  };

  useEffect(() => {
    getProductsData();
  }, [location.pathname]);

  useEffect(() => {
    const refreshProducts = () => {
      if (document.visibilityState === "visible") {
        getProductsData();
      }
    };

    document.addEventListener("visibilitychange", refreshProducts);
    return () => document.removeEventListener("visibilitychange", refreshProducts);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!token && savedToken) {
      setToken(savedToken);
      return;
    }

    if (token) {
      getUserCart(token);
      getUserWishlist(token);
    }
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    wishlistItems,
    setWishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
    navigate,
    backendUrl,
    setToken,
    token,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
