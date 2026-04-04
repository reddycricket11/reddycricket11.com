const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Withdraw = require("../models/withdraw");
const Transaction = require("../models/transaction");

// ================================
// 🔥 COMMON FUNCTION
// ================================
function deductBalance(user, amount) {
  let withdrawAmount = Number(amount);

  if (user.winnings >= withdrawAmount) {
    user.winnings -= withdrawAmount;
  } else {
    withdrawAmount -= user.winnings;
    user.winnings = 0;
  }

  user.wallet -= Number(amount);
}

// ================================
// ✅ MANUAL WITHDRAW (ADMIN)
// ================================
router.post("/manual-withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.wallet < Number(amount)) {
      return res.status(400).json({
        message: "Insufficient Balance",
      });
    }

    const withdraw = await Withdraw.create({
      amount: Number(amount),
      userId,
      status: "completed",
      isWithdrawCompleted: true
    });

    await Transaction.create({
      userId,
      amount: Number(amount),
      type: "withdraw",
      status: "completed",
      action: "withdraw",
      transactionId: withdraw._id
    });

    // 🔥 MAIN LOGIC
    deductBalance(user, amount);

    await user.save();

    return res.status(200).json({
      message: "Manual Withdraw Success",
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Manual Withdraw Failed",
    });
  }
});

module.exports = router;
