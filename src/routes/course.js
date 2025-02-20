const router = require("express").Router();
const courseController = require("../controllers/course");
const { isAuthenticated, isAuthorized, findSchool } = require("../middleware");

router.post("/", isAuthenticated, courseController.create);
router.get("/featured/random", courseController.getRandomFeaturedCourse);
router.get("/featured/:categoryId", courseController.getFeaturedCourse);
router.get("/trending", [ findSchool ],courseController.getTrendingCourses);

router.get("/categories/:slug", [ findSchool ],courseController.getLiveCoursesByCategory);
// router.get("/courses",courseController.getLiveCourses);

router.get("/enrolled",[findSchool, isAuthenticated], courseController.getEnrolledCourses);
router.get("/enrolled/:slug",[findSchool, isAuthenticated],courseController.getEnrolledCourse);
router.get("/search", [ findSchool ],courseController.searchCourses);
router.get("/live",[ findSchool ],courseController.getLiveCourses);

router.patch("/:courseId", [
  isAuthenticated,
  isAuthorized,
  // fileStorage(["jpg","JPG","jpeg","JPEG","png","PNG","gif","GIF"])
], courseController.update);

router.delete("/:courseId",[ isAuthenticated, isAuthorized ], courseController.delete);

router.get("/:slug", [ findSchool ], courseController.getSingleCourseDetails);
// router.post("/:courseId/order", isAuthenticated, courseController.order);
router.post("/:courseId/rating",isAuthenticated, courseController.rateCourse);
router.delete("/:courseId/rating",isAuthenticated, courseController.deleteRating);

module.exports = router;