const router = require("express").Router();
const sectionController = require("../controllers/section");
const { isAuthenticated, isAuthorized } = require("../middleware");

router.post("/",isAuthenticated, sectionController.create);
router.patch("/:sectionId",[isAuthenticated, isAuthorized], sectionController.update);
router.delete("/:sectionId",[isAuthenticated, isAuthorized], sectionController.delete);

module.exports = router;