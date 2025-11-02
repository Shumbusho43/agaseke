const express = require("express");
const router = express.Router();
const { createSaving, addFunds, getUserSavings, getSavingById } = require("../controllers/savingController");
const { auth } = require("../middleware/authMiddleware");

router.post("/saving/create", auth, createSaving);
router.post("/saving/add", auth, addFunds);
//get user savings
router.get("/saving", auth, getUserSavings);
router.get("/saving/:id", auth, getSavingById);

module.exports = router;