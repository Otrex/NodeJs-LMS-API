const router = require("express").Router();
const schoolController = require("../controllers/school");
const { isDumoAuthenticated } = require("../middleware");

// router.get('/', isDumoAuthenticated, schoolController.getSchools);
// router.post('/', isDumoAuthenticated, schoolController.createSchool);
router.get('/metadata', schoolController.getMetaData);

module.exports = router;