const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware");
const supportController = require("../controllers/support");

router.post("/ticket/:ticketId/reply", [isAuthenticated, isAdmin], supportController.replySupportTicket);
router.post("/ticket", isAuthenticated, supportController.createSupportTicket);
router.get("/ticket", isAuthenticated, supportController.getTickets);

module.exports = router;