const router = require("express").Router();
const affiliateController = require("../controllers/affiliate");
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

router.post("/record", affiliateController.recordClick);

//Todo: Remove this route to the proper place. Here is only for testing!!!
router.get("/analytics", findSchool, affiliateController.testAnalytics);

module.exports = router;