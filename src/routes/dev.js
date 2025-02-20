const router = require("express").Router();
const devController = require("../controllers/dev");
const { isAuthenticated } = require("../middleware");

router.post("/enrol/:courseId", isAuthenticated, devController.enrol);

module.exports = router;