import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";

const Profile = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

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
        setFormData({
          name: response.data.user.name,
          email: response.data.user.email,
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setFormData({
      name: user.name,
      email: user.email,
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setFormData({
      name: user.name,
      email: user.email,
    });
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      const response = await axios.post(
        backendUrl + "/api/user/profile/update",
        formData,
        { headers: { token } },
      );

      if (response.data.success) {
        setUser(response.data.user);
        setEditing(false);
        toast.success(response.data.message || "Profile updated successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
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
          {editing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-800"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-800"
                  required
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-black text-white px-5 py-2 text-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={submitting}
                  className="border border-gray-800 px-5 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-base font-medium">{user.name}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium">{user.email}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={startEditing}
                  className="bg-black text-white px-5 py-2 text-sm"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="border border-gray-800 px-5 py-2 text-sm hover:bg-gray-50"
                >
                  View My Orders
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Could not load profile.</p>
      )}
    </div>
  );
};

export default Profile;
