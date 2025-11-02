const express = require("express");
const router = express.Router();
const { requestWithdrawal, approveWithdrawal, getUserWithdrawals, getPendingForCoSigner } = require("../controllers/withdrawalController");
const { auth } = require("../middleware/authMiddleware");

router.post("/withdrawal/request", auth, requestWithdrawal);
router.post("/withdrawal/approve/:id", auth, approveWithdrawal);
//get user withdrawals
router.get("/withdrawal", auth, getUserWithdrawals);
//get pending withdrawals for co-signer
router.get("/withdrawal/pending", auth, getPendingForCoSigner);
module.exports = router;