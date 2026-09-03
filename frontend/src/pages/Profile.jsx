import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";

const Profile = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        backendUrl + "/api/user/profile",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadProfile();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"PROFILE"} />
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading profile...</p>
      ) : user ? (
        <div className="max-w-md border border-gray-200 rounded-lg p-6 text-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-base font-medium">{user.name}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="border border-gray-800 px-5 py-2 text-sm hover:bg-gray-50"
          >
            View My Orders
          </button>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Could not load profile.</p>
      )}
    </div>
  );
};

export default Profile;
