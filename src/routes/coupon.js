const router = require("express").Router();
const couponController = require("../controllers/coupon");
const {
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isDumoAuthenticated,
    isDumoAuthorized,
    isSchoolAdmin,
    findSchool,
    fileStorage
  } = require("../middleware");


router.get("/", couponController.getAllCoupons);

//This route would return the Coupon Sales that are for that specific coupon
router.get("/:couponId", couponController.getSpecificCoupon);

router.post("/", couponController.createCoupon);
router.get("/verify/:couponCode", findSchool, couponController.verifyCoupon);
// router.post("/record", couponController.recordClick);
router.post("/sale", couponController.recordCouponSale);

router.delete("/:couponId", couponController.deleteCoupon);

router.patch("/deactivate/:couponId", couponController.deactivateCoupon);
router.patch("/activate/:couponId", couponController.activateCoupon);



module.exports = router;