const router = require("express").Router();
const mediaController = require("../controllers/media");
const { isAuthenticated, fileStorage } = require("../middleware");

router.post("/",[ isAuthenticated, fileStorage() ],mediaController.create);

module.exports = router;