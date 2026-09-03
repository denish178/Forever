import React, { useContext, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ResetPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!token || !email) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        backendUrl + "/api/user/reset-password",
        { email, token, password },
      );

      if (response.data.success) {
        toast.success(response.data.message || "Password reset successful");
        navigate("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">Reset Password</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>
        <p className="text-sm text-gray-500 text-center">
          This reset link is invalid or incomplete.
        </p>
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="bg-black text-white font-light px-8 py-2 mt-4"
        >
          Request New Link
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <p className="text-sm text-gray-500 text-center">
        Set a new password for <span className="font-medium">{email}</span>
      </p>

      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="New Password"
        required
        minLength={8}
      />

      <input
        onChange={(e) => setConfirmPassword(e.target.value)}
        value={confirmPassword}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Confirm Password"
        required
        minLength={8}
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50"
      >
        {submitting ? "Updating..." : "Update Password"}
      </button>

      <p
        onClick={() => navigate("/login")}
        className="text-sm cursor-pointer hover:text-black"
      >
        Back to Login
      </p>
    </form>
  );
};

export default ResetPassword;
