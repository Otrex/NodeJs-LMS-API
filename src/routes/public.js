const router = require("express").Router();
const userRoutes = require("./user");
const courseRoutes = require("./course");
const cartRoutes = require("./cart");
const transactionRoutes = require("./transaction");
const lectureRoutes = require("./lecture");
const affiliateRoutes = require("./affiliate");
const couponRoutes = require("./coupon")

router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/cart", cartRoutes);
router.use("/transaction", transactionRoutes);
router.use("/lecture", lectureRoutes);
router.use("/affiliate", affiliateRoutes);
router.use("/coupon", couponRoutes);

module.exports = router;