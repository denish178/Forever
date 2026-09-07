const coupons = [
  {
    code: "SAVE20",
    discountType: "percent",
    discountValue: 20,
    minOrderAmount: 500,
    maxDiscount: 1000,
    isActive: true,
    usageLimit: 0,
  },
  {
    code: "FLAT100",
    discountType: "flat",
    discountValue: 100,
    minOrderAmount: 800,
    isActive: true,
    usageLimit: 0,
  },
];

export default coupons;
