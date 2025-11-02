const express = require("express");
const router = express.Router();
const { createSaving, addFunds } = require("../controllers/savingController");
const { auth } = require("../middleware/authMiddleware");

router.post("/saving/create", auth, createSaving);
router.post("/saving/add", auth, addFunds);

module.exports = router;