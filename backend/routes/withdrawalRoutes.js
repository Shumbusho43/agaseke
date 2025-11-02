const express = require("express");
const router = express.Router();
const { requestWithdrawal, approveWithdrawal } = require("../controllers/withdrawalController");
const { auth } = require("../middleware/authMiddleware");

router.post("/withdrawal/request", auth, requestWithdrawal);
router.post("/withdrawal/approve/:id", auth, approveWithdrawal);
module.exports = router;