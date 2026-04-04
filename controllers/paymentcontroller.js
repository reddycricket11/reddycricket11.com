const request = require("request");
const Razorpay = require("razorpay");
const express = require("express");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const crypto = require("crypto");
const axios = require("axios");

const Transaction = require("../models/transaction");
const NewPayment = require("../models/newPayment");
const Withdraw = require("../models/withdraw");
const User = require("../models/user");
const Notification = require("../models/notification");

const router = express.Router();
const { ObjectId } = mongoose.Types;

dotenv.config();

const instance = new Razorpay({
  key_id: "rzp_test_3FLuLisPuowtZP",
  key_secret: "paGWw3r0v1ty8K3U9YDxOu8f",
});


// ================================
// 🔥 COMMON FUNCTION (IMPORTANT)
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
// CREATE PAYMENT
// ================================
router.get("/createpayment/:amount", (req, res) => {
  try {
    const options = {
      amount: Number(req.params.amount) * 100,
      currency: "INR",
      receipt: uuidv4(),
      payment_capture: 0,
    };

    instance.orders.create(options, (err, order) => {
      if (err) return res.status(500).json({ message: "Error" });
      return res.status(200).json(order);
    });

  } catch (err) {
    return res.status(500).json({ message: "Error" });
  }
});


// ================================
// WITHDRAW REQUEST (USER)
// ================================
router.post("/withdraw", async (req, res) => {
  try {
    const user = await User.findById(req.body.uidfromtoken);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wallet < Number(req.body.amount)) {
      return res.status(400).json({ message: "Insufficient Balance" });
    }

    const withdraw = await Withdraw.create({
      amount: req.body.amount,
      userId: req.body.uidfromtoken,
      status: "pending"
    });

    await Transaction.create({
      userId: req.body.uidfromtoken,
      amount: req.body.amount,
      transactionId: withdraw._id,
      type: "withdraw",
      status: "pending",
      action: "withdraw"
    });

    await Notification.create({
      userId: req.body.uidfromtoken,
      recipientType: "admin",
      type: "withdraw",
      title: "withdraw request",
      message: "New withdraw request"
    });

    return res.status(200).json({ message: "Request sent" });

  } catch (err) {
    return res.status(500).json({ message: "Error" });
  }
});


// ================================
// 🔥 MANUAL WITHDRAW (ADMIN)
// ================================
router.post("/manual-withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wallet < Number(amount)) {
      return res.status(400).json({ message: "Insufficient Balance" });
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

    // 🔥 FIXED LOGIC
    deductBalance(user, amount);

    await user.save();

    return res.status(200).json({
      message: "Manual Withdraw Success"
    });

  } catch (err) {
    return res.status(500).json({ message: "Error" });
  }
});


// ================================
// APPROVE WITHDRAW (ADMIN)
// ================================
router.get("/approveWithdraw", async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.query.withdrawId);
    if (!withdraw) return res.status(404).json({ message: "Not found" });

    const user = await User.findById(withdraw.userId);

    withdraw.status = "completed";
    withdraw.isWithdrawCompleted = true;
    await withdraw.save();

    // 🔥 FIXED LOGIC
    deductBalance(user, withdraw.amount);

    await user.save();

    const txn = await Transaction.findOne({ transactionId: withdraw._id });
    if (txn) {
      txn.status = "completed";
      await txn.save();
    }

    return res.status(200).json({
      message: "Withdraw Approved"
    });

  } catch (err) {
    return res.status(500).json({ message: "Error" });
  }
});


// ================================
// REJECT WITHDRAW
// ================================
router.get("/rejectWithdraw", async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.query.withdrawId);
    withdraw.status = "rejected";
    withdraw.isWithdrawCompleted = true;
    await withdraw.save();

    return res.status(200).json({
      message: "Rejected"
    });

  } catch (err) {
    return res.status(500).json({ message: "Error" });
  }
});


module.exports = router;
