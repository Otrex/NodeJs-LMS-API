const router = require("express").Router();
const transactionController = require("../controllers/transaction");
const { isAuthenticated, findSchool } = require("../middleware");

router.post("/", [findSchool, isAuthenticated] ,transactionController.create);
router.get("/verify/:transactionRef", [findSchool, isAuthenticated],isAuthenticated, transactionController.verifyTransaction);
router.get("/adminVerify/:schoolId/:transactionRef", findSchool, transactionController.verifyTransaction)

// Paystack webhook url
router.post("/paystack/webhook", [findSchool, isAuthenticated],transactionController.processPaystackEvent);

router.get("/providers", [findSchool], transactionController.getPaymentProviders);

module.exports = router;
