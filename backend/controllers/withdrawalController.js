const Withdrawal = require("../models/withdrawalModel");
const Saving = require("../models/savingModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

// Create transporter using SMTP from env vars
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

// helper to escape regex special chars when building case-insensitive match
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.requestWithdrawal = async (req, res) => {
        // #swagger.tags = ['Withdrawal']
  try {
    const { amount } = req.body;
    const saving = await Saving.findOne({ userId: req.user.id });
    if (!saving) {
      return res.status(404).json({ error: 'No saving goal found for this user.' });
    }

    // Previously withdrawals were blocked until lockUntil. Change: allow
    // creating a withdrawal request even if the goal is locked so the
    // co-signer can review and decide. We still keep the lockUntil value
    // for informational purposes.
    if (amount > saving.currentAmount) {
        return res.status(400).json({ error: "Insufficient funds in saving goal. You can withdraw up to " + saving.currentAmount });
        }
    const withdrawal = new Withdrawal({
      userId: req.user.id,
      amount,
      status: "pending",
    });

    await withdrawal.save();
    console.log(`Withdrawal created: id=${withdrawal._id} user=${req.user.id} amount=${amount}`);
    // send email to co-signer if transporter is configured
    try {
      const user = await User.findById(req.user.id);
      console.log(`Requester user: ${user._id} email=${user.email} coSignerEmail=${user.coSignerEmail}`);
      const coSignerEmail = user.coSignerEmail;
      if (coSignerEmail && transporter) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: coSignerEmail,
          subject: `Withdrawal request from ${user.name}`,
          text: `User ${user.name} (${user.email}) has requested a withdrawal of ${amount} RWF. Please log into the Agaseke app to approve or reject this request.`,
        };
        await transporter.sendMail(mailOptions);
      }
    } catch (mailErr) {
      console.error('Failed to send co-signer email:', mailErr.message || mailErr);
    }

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
    const withdrawal = await Withdrawal.findById(req.params.id).populate('userId', 'name email coSignerEmail');
  const user = withdrawal.userId;

  // Ensure the logged-in user is the co-signer (compare case-insensitive, trimmed)
  const storedCo = String(user.coSignerEmail || "").trim().toLowerCase();
  const requesterCo = String(req.user.email || "").trim().toLowerCase();
  if (storedCo !== requesterCo) {
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
    console.log(`getPendingForCoSigner called by ${req.user.email}`);
    // match coSignerEmail case-insensitive and trimmed
    const cosignerEmail = String(req.user.email || "").trim();
    const users = await User.find({ coSignerEmail: { $regex: `^${escapeRegex(cosignerEmail)}$`, $options: 'i' } });
    console.log(`Found ${users.length} users with coSignerEmail=${cosignerEmail}`);
    const userIds = users.map((u) => u._id);

    // Find pending withdrawals for those users
    const withdrawals = await Withdrawal.find({ userId: { $in: userIds }, status: "pending" }).populate('userId', 'name email');
    console.log(`Found ${withdrawals.length} pending withdrawals for co-signer ${cosignerEmail}`);
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
