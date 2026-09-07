import "dotenv/config";
import connectDB from "./config/mongodb.js";
import couponModel from "./models/couponModel.js";
import coupons from "./data/coupons.js";

const seedCoupons = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    for (const coupon of coupons) {
      await couponModel.findOneAndUpdate(
        { code: coupon.code },
        coupon,
        { upsert: true, new: true },
      );
      console.log(`Coupon ready: ${coupon.code}`);
    }

    console.log("Coupons seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Coupon seeding error:", error);
    process.exit(1);
  }
};

seedCoupons();
