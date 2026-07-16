import "dotenv/config";
import connectDB from "./config/mongodb.js";
import productModel from "./models/productModel.js";
import products from "./data/products.js";

const seedProducts = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    await productModel.deleteMany();
    console.log("🗑️ Old products removed");

    await productModel.insertMany(products);
    console.log("🎉 Products seeded successfully");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedProducts();
