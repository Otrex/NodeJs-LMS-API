const router = require("express").Router();
const userController = require("../controllers/user");
const { isAuthenticated, fileStorage, findSchool } = require("../middleware");

router.post("/register", [findSchool], userController.register);
router.post("/login", [findSchool], userController.login);
router.post("/auth/google", userController.signInWithGoogle);
router.post("/auth/facebook", userController.signInWithFacebook);
router.get("/profile", [findSchool, isAuthenticated], userController.getProfile);
router.patch("/profile", [findSchool, isAuthenticated], userController.updateProfile);
router.patch("/account", [findSchool, isAuthenticated], userController.updateAccount);
router.post("/account/forgot", [findSchool], userController.forgotPassword);
router.post("/account/reset/:token", [findSchool], userController.resetPassword);
router.post("/account/verify/:token", [findSchool], userController.verifyEmail);

router.post("/newsletter/subscribe", userController.subscribeToNewsletter);

router.get("/bank/list", [findSchool, isAuthenticated], userController.getBanks);
router.get("/bank/confirm", isAuthenticated, userController.confirmBankAccount);
router.patch("/bank/details", isAuthenticated, userController.updateBankDetails);
router.get("/bank/details", [findSchool, isAuthenticated], userController.getBankDetails);

/*
* Affiliate Shit
* */
router.get("/affiliate/earnings", [findSchool, isAuthenticated], userController.getAffiliateEarnings);


module.exports = router;
