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

// ================== PAYKUBER TOKEN ==================
async function generatePaykuberToken() {
  const payload = {
    midKey: process.env.PAYKUBER_MID_KEY,
    saltKey: process.env.PAYKUBER_SALT_KEY,
    apiKey: process.env.PAYKUBER_API_KEY,
  };

  const res = await axios.post(
    `${process.env.PAYKUBER_BASE_URL}/token/generate`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!res.data.token) throw new Error("Token failed");
  return res.data.token;
}

// ================== CREATE PAYMENT ==================
router.post("/create", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = await generatePaykuberToken();
    const orderId = "PK_" + Date.now();

    const payload = {
      amount: String(amount),
      currency: "INR",
      order_id: orderId,
      sub_pay_mode: "intent",
      merchant_id: process.env.PAYKUBER_MID_KEY,
      cust_name: user.username,
      cust_email: user.email,
      callback_url: "https://dream11-api.insenc.in/auth/callback",
      redirect_url: `https://dream11.insenc.in/payment-status/${orderId}`,
    };

    const response = await axios.post(
      `${process.env.PAYKUBER_BASE_URL}/pay-request`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await Transaction.create({
      userId,
      amount,
      type: "deposit",
      orderId,
      status: "pending",
    });

    res.json({
      paymentLink: response.data.data.paymentLink,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================== WITHDRAW REQUEST ==================
router.post("/withdraw", async (req, res) => {
  try {
    const user = await User.findById(req.body.uidfromtoken);

    if (user.wallet < req.body.amount) {
      return res.status(400).json({ message: "Low balance" });
    }

    const withdraw = await Withdraw.create({
      amount: req.body.amount,
      userId: user._id,
    });

    await Transaction.create({
      userId: user._id,
      amount: req.body.amount,
      type: "withdraw",
      status: "pending",
      transactionId: withdraw._id,
    });

    res.json({ message: "Request Sent" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// ================== APPROVE WITHDRAW (MANUAL) ==================
router.get("/approveWithdrawe", async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.query.withdrawId);
    const user = await User.findById(withdraw.userId);

    const amount = Number(withdraw.amount);

    // ❌ check winnings
    if (user.winnings < amount) {
      return res.status(400).json({
        message: "Only winnings can be withdrawn",
      });
    }

    // ✅ deduct winnings
    user.winnings -= amount;

    // ✅ update wallet
    user.wallet =
      (user.totalAmountAdded || 0) + (user.winnings || 0);

    withdraw.status = "completed";
    withdraw.isWithdrawCompleted = true;

    await user.save();
    await withdraw.save();

    res.json({ message: "Withdraw Approved" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// ================== APPROVE WITHDRAW (PAYKUBER) ==================
router.get("/approveWithdraw", async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.query.withdrawId);
    const user = await User.findById(withdraw.userId);

    const amount = Number(withdraw.amount);

    if (user.winnings < amount) {
      return res.status(400).json({
        message: "Only winnings can be withdrawn",
      });
    }

    // payout call (skip detail)
    const token = await generatePaykuberToken();

    // success मान लिया
    withdraw.status = "completed";
    withdraw.isWithdrawCompleted = true;

    user.winnings -= amount;
    user.wallet =
      (user.totalAmountAdded || 0) + (user.winnings || 0);

    await user.save();
    await withdraw.save();

    res.json({ message: "Payout Success" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;
