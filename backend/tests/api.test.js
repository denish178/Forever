import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import connectDB, { disconnectDB } from "../config/mongodb.js";
import app from "../server.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

const waitForDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for MongoDB connection"));
    }, 15000);

    mongoose.connection.once("connected", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
};

const createUser = async (overrides = {}) => {
  const user = await userModel.create({
    name: "Test User",
    email: `user${Date.now()}@test.com`,
    password: "hashed-password",
    ...overrides,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return { user, token };
};

const createAdminToken = () => {
  return jwt.sign(
    process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD,
    process.env.JWT_SECRET,
  );
};

describe("Forever API", () => {
  beforeAll(async () => {
    await connectDB();
    await waitForDatabase();
  }, 120000);

  afterEach(async () => {
    await userModel.deleteMany({});
    await productModel.deleteMany({});
    await orderModel.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test("GET / returns API Working", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("API Working");
  });

  test("POST /api/user/register creates a new user", async () => {
    const response = await request(app).post("/api/user/register").send({
      name: "Denish",
      email: "denish@test.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  test("POST /api/user/register rejects duplicate email", async () => {
    await request(app).post("/api/user/register").send({
      name: "Denish",
      email: "denish@test.com",
      password: "password123",
    });

    const response = await request(app).post("/api/user/register").send({
      name: "Another User",
      email: "denish@test.com",
      password: "password1234",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/user/login rejects invalid credentials", async () => {
    await request(app).post("/api/user/register").send({
      name: "Denish",
      email: "denish@test.com",
      password: "password123",
    });

    const response = await request(app).post("/api/user/login").send({
      email: "denish@test.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/user/profile requires authentication", async () => {
    const response = await request(app).post("/api/user/profile").send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/user/profile returns user data when authenticated", async () => {
    const { user, token } = await createUser({
      email: "profile@test.com",
    });

    const response = await request(app)
      .post("/api/user/profile")
      .set("token", token)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(user.email);
    expect(response.body.user.password).toBeUndefined();
  });

  test("POST /api/user/profile/update updates name and email", async () => {
    const { token } = await createUser({
      email: "update@test.com",
      name: "Old Name",
    });

    const response = await request(app)
      .post("/api/user/profile/update")
      .set("token", token)
      .send({
        name: "New Name",
        email: "newemail@test.com",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.name).toBe("New Name");
    expect(response.body.user.email).toBe("newemail@test.com");
  });

  test("GET /api/product/list returns products array", async () => {
    await productModel.create({
      name: "Test Hoodie",
      description: "Warm hoodie",
      price: 60,
      image: ["p_img1.png"],
      category: "Men",
      subCategory: "Topwear",
      sizes: ["M", "L"],
      bestseller: false,
      date: Date.now(),
    });

    const response = await request(app).get("/api/product/list");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.products.length).toBe(1);
    expect(response.body.products[0].name).toBe("Test Hoodie");
  });

  test("POST /api/wishlist/add saves item for authenticated user", async () => {
    const { token } = await createUser({ email: "wishlist@test.com" });
    const product = await productModel.create({
      name: "Wishlist Product",
      description: "Test product",
      price: 40,
      image: ["p_img2.png"],
      category: "Women",
      subCategory: "Topwear",
      sizes: ["S"],
      bestseller: false,
      date: Date.now(),
    });

    const response = await request(app)
      .post("/api/wishlist/add")
      .set("token", token)
      .send({ itemId: product._id.toString() });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const wishlistResponse = await request(app)
      .post("/api/wishlist/get")
      .set("token", token)
      .send({});

    expect(wishlistResponse.body.wishlistData[product._id.toString()]).toBe(true);
  });

  test("POST /api/review/eligibility returns false without purchase", async () => {
    const { token } = await createUser({ email: "review@test.com" });
    const product = await productModel.create({
      name: "Review Product",
      description: "Test product",
      price: 55,
      image: ["p_img3.png"],
      category: "Men",
      subCategory: "Bottomwear",
      sizes: ["M"],
      bestseller: false,
      date: Date.now(),
    });

    const response = await request(app)
      .post("/api/review/eligibility")
      .set("token", token)
      .send({ productId: product._id.toString() });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.canReview).toBe(false);
    expect(response.body.hasReview).toBe(false);
  });

  test("POST /api/dashboard/stats requires admin authentication", async () => {
    const { token } = await createUser({ email: "notadmin@test.com" });

    const response = await request(app)
      .post("/api/dashboard/stats")
      .set("token", token)
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/dashboard/stats returns stats for admin", async () => {
    const adminToken = createAdminToken();

    await productModel.create({
      name: "Dashboard Product",
      description: "Stats test",
      price: 80,
      image: ["p_img4.png"],
      category: "Kids",
      subCategory: "Winterwear",
      sizes: ["S"],
      bestseller: true,
      date: Date.now(),
    });

    const response = await request(app)
      .post("/api/dashboard/stats")
      .set("token", adminToken)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.stats.totalProducts).toBe(1);
    expect(response.body.stats.totalOrders).toBe(0);
  });
});
