import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ForgotPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      const response = await axios.post(
        backendUrl + "/api/user/forgot-password",
        { email },
      );

      if (response.data.success) {
        setSent(true);
        toast.success(
          response.data.message ||
            "If an account exists with this email, a reset link has been sent",
        );
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

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Forgot Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <p className="text-sm text-gray-500 text-center">
        Enter your email and we will send you a password reset link.
      </p>

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
        disabled={sent}
      />

      <button
        type="submit"
        disabled={submitting || sent}
        className="bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-50"
      >
        {submitting ? "Sending..." : sent ? "Link Sent" : "Send Reset Link"}
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

export default ForgotPassword;
