
const mongoose = require("mongoose");
const Contest = require("../models/contest");
const Team = require("../models/team");
const MatchLive = require("../models/matchlive");
const User = require("../models/user");
const express = require("express");
const { messaging } = require("../utils/firebaseinitialize");
const Transaction = require("../models/transaction");

// function prizeBreakupRules(prize, numWinners){
//     let prizeMoneyBreakup = [];
//     for(let i = 0; i < numWinners; i++){

//     }
// }
module.exports.startTransaction = async function () {
  let date = new Date();
  const endDate = new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000);
  date = new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000);

  const matches = await MatchLive.find({
    date: {
      $gte: new Date(date),
      $lt: new Date(endDate),
    },
  });

  for (let i = 0; i < matches.length; i++) {

    // 👉 FIX 1: already processed match skip
    if (matches[i].result !== "Complete" || matches[i].transaction === true) {
      continue;
    }

    const contests = await Contest.find({ matchId: matches[i].matchId });
    // ✅ contest already processed skip
if (!contests.length) continue;

    for (let k = 0; k < contests.length; k++) {
      // ✅ already distributed contest skip
if (contests[k].isDistributed) continue;
      let teams = [];

      contests[k].teamsId = contests[k].teamsId.filter((t) => t);

      if (contests[k]?.teamsId?.length) {
        for (let j = 0; j < contests[k].teamsId.length; j++) {
          if (mongoose.Types.ObjectId.isValid(contests[k].teamsId[j])) {
            const team = await Team.findById(contests[k].teamsId[j]);
            if (team) teams.push(team);
          }
        }
      }

      // 👉 FIX 2: descending sort (highest points first)
      teams.sort((a, b) => b.points - a.points);

      for (let j = 0; j < contests[k].prizeDetails.length; j++) {

        if (teams.length > 0 && teams[j]?.userId) {

          const user = await User.findById(teams[j].userId);
          const prize = contests[k].prizeDetails[j]?.prize || 0;

          if (!user || prize === 0) continue;

          const contest = contests[k];
const match = matches[i];

const isFull = contest.isFull;
const isCancelled = contest.isCancelled;
const isMatchCompleted = match.result === "Complete";

const shouldGivePrize = isFull && isMatchCompleted && !isCancelled;

          if (shouldGivePrize) {
  user.wallet += prize;
  user.totalAmountWon += prize;
   
            try {
            await user.save();

            // 👉 transaction save
            await Transaction.create({
              userId: user._id,
              amount: prize,
              action: "winnings",
              status: "completed",
              transactionId: contests[k]._id,
            });

            console.log("✅ WINNING ADDED:", user._id, prize);

            // 👉 notification
            if (user?.fcmtoken) {
              const message = {
                notification: {
                  title: "Congratulations!",
                  body: `You won ₹${prize}! Check your wallet.`,
                },
                token: user.fcmtoken,
              };
              await messaging.send(message);
            }

          } catch (e) {
            console.log("❌ Error:", e);
          }
        }
      }
     }
      // ✅ contest ko processed mark karo
contests[k].isDistributed = true;
await contests[k].save();
    }

    // 👉 FIX 3: match ko processed mark karo
    await MatchLive.updateOne(
      { matchId: matches[i]?.matchId },
      {
        $set: { transaction: true },
      }
    );
  }

  console.log("🎯 All winnings distributed");
};
