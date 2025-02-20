const router = require("express").Router();
const categoryController = require("../controllers/category");
const { isAuthenticated, isAdmin, fileStorage } = require("../middleware");

router.get("/", categoryController.getAllCategories);
router.post("/",[ isAuthenticated, isAdmin, fileStorage(["svg"]) ], categoryController.create);
router.patch("/:categoryId",[isAuthenticated, isAdmin, fileStorage(["svg"]) ], categoryController.update);
router.delete("/:categoryId",[isAuthenticated, isAdmin],categoryController.delete);
router.get("/parent", categoryController.getParentCategories);
router.get("/:categoryId",categoryController.getSubcategories);

module.exports = router;