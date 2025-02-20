const router = require("express").Router();
const instructorController = require("../controllers/instructor");
const { isAuthenticated } = require("../middleware");

router.get("/courses",isAuthenticated,instructorController.getCourses);
router.post("/submit",[ isAuthenticated ], instructorController.submitForReview);
router.get("/courses/:courseId", isAuthenticated, instructorController.getCourse);
router.get("/analytics", isAuthenticated, instructorController.getAnalytics);
router.get("/transactions", isAuthenticated, instructorController.getTransactions);

module.exports = router;