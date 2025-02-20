const router = require("express").Router();
const cartController = require("../controllers/cart");
const { isAuthenticated, findSchool } = require("../middleware");

router.get("/", [findSchool, isAuthenticated], cartController.getCart);
router.post("/buy", [findSchool, isAuthenticated], cartController.buyCoursesInCart);
router.post("/:courseId", [findSchool, isAuthenticated], cartController.addCourseToCart);
router.delete("/:courseId", [findSchool, isAuthenticated], cartController.removeCourseFromCart);

module.exports = router;