const mongoose = require("mongoose");

const savingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  goalName: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  lockUntil: { type: Date, required: true },
});

module.exports = mongoose.model("Saving", savingSchema);
