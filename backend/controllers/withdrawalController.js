const Withdrawal = require("../models/withdrawalModel");
const Saving = require("../models/savingModel");
const User = require("../models/userModel");

exports.requestWithdrawal = async (req, res) => {
        // #swagger.tags = ['Withdrawal']
  try {
    const { amount } = req.body;
    const saving = await Saving.findOne({ userId: req.user.id });

    if (new Date() < new Date(saving.lockUntil)) {
      //format date nicely. Here is sample of how i store it 2026-03-01T00:00:00.000+00:00
      const formatedDate = saving.lockUntil.toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric"});
      return res.status(403).json({ error: `Withdrawal locked until ${formatedDate}` });
    }
    if (amount > saving.currentAmount) {
        return res.status(400).json({ error: "Insufficient funds in saving goal. You can withdraw up to " + saving.currentAmount });
        }
    const withdrawal = new Withdrawal({
      userId: req.user.id,
      amount,
      status: "pending",
    });

    await withdrawal.save();
    res.status(201).json({ message: "Withdrawal request sent to co-signer" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.approveWithdrawal = async (req, res) => {
        // #swagger.tags = ['Withdrawal']
  const statusOptions = ["approved", "rejected"];
  const { status } = req.body;
  if (!statusOptions.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const withdrawal = await Withdrawal.findById(req.params.id);
  const user = await User.findById(withdrawal.userId);

  // Ensure the logged-in user is the co-signer
  if (user.coSignerEmail !== req.user.email) {
    return res.status(403).json({ error: "Not authorized" });
  }
  //check if withdrawal is already processed
    if (withdrawal.status !== "pending") {
        return res.status(400).json({ error: "Withdrawal already processed" });
    }
  withdrawal.status = status;
  await withdrawal.save();

  // Deduct from user’s savings
    if (status === "rejected") {
    return res.json({ message: "Withdrawal rejected" });
  }
  const saving = await Saving.findOne({ userId: user._id });
  if (saving.currentAmount >= withdrawal.amount) {
    saving.currentAmount -= withdrawal.amount;
    await saving.save();
  }
  res.json({ message: "Withdrawal approved and processed" });
};
exports.getUserWithdrawals = async (req, res) => {
        // #swagger.tags = ['Withdrawal']
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getPendingForCoSigner = async (req, res) => {
        // #swagger.tags = ['Withdrawal']
  try {
    // Find all users for whom this co-signer is assigned
    const users = await User.find({ coSignerEmail: req.user.email });
    const userIds = users.map(u => u._id);

    // Find pending withdrawals for those users
    const withdrawals = await Withdrawal.find({ userId: { $in: userIds }, status: "pending" });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
