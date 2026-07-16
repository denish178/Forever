import React, { useState } from "react";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (!email) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setMessage("Thanks! You are subscribed. Check your inbox for details.");
    setEmail("");
  };

  return (
    <div className=" text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3">
        Join our newsletter for exclusive offers, style updates, and 20% off
        your first order.
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full sm:flex-1 outline-none"
          type="email"
          placeholder="Enter your email"
          required
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-10 py-4"
        >
          SUBSCRIBE
        </button>
      </form>
      {message && <p className="text-sm text-green-600">{message}</p>}
    </div>
  );
};

export default NewsletterBox;
