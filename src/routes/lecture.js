const router = require("express").Router();
const lectureController = require("../controllers/lecture");
const adminController = require("../controllers/admin");
const {
  isAuthenticated,
  isAuthorized,
  isAdmin,
  fileStorage,
  findSchool
} = require("../middleware");

router.post("/",[isAuthenticated, fileStorage() ],lectureController.create);
router.patch("/:lectureId",[isAuthenticated, isAuthorized, fileStorage()], lectureController.update);
router.delete("/:lectureId",[isAuthenticated, isAuthorized],lectureController.delete);

// Change VIDEO URL to Youtube link
router.patch("/:lectureId/video",[isAuthenticated, isAdmin], adminController.updateVideo);

router.patch("/:lectureId/completed", [findSchool, isAuthenticated], lectureController.courseLectureCompleted);

module.exports = router;