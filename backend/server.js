import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import wishlistRouter from "./routes/wishlistRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import orderRouter from "./routes/orderRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

// Load env FIRST
dotenv.config();

if (process.env.NODE_ENV === "test") {
  process.env.MONGO_URI = "";
}

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Connect services AFTER env is loaded
if (process.env.NODE_ENV !== "test") {
  connectDB();
}
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/review", reviewRouter);
app.use("/api/order", orderRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use(notFoundHandler);
app.use(errorHandler);

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log("Server started on PORT : " + port));
}

export default app;
