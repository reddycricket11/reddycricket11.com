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

function compare(a, b) {
  return b.points - a.points; // ✅ FIXED
}

module.exports.startTransaction = async function () {
  let date = new Date();
  const endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000 * 2);
  date = new Date(date.getTime() - 24 * 60 * 60 * 1000 * 2);

  const matches = await MatchLive.find({
    date: {
      $gte: new Date(date),
      $lt: new Date(endDate),
    },
  });

  for (let i = 0; i < matches.length; i++) {
    if (matches[i].result == "Complete" && !matches[i].transaction) {

      const contests = await Contest.find({ matchId: matches[i].matchId });

      for (let k = 0; k < contests.length; k++) {

        let teams = [];

        contests[k].teamsId = contests[k].teamsId.filter((t) => t);

        if (contests[k]?.teamsId?.length) {

          for (let j = 0; j < contests[k].teamsId.length; j++) {

            if (mongoose.Types.ObjectId.isValid(contests[k].teamsId[j])) {

              const team = await Team.findById(contests[k].teamsId[j]);

              if (team) teams.push(team); // ✅ null safe
            }
          }

          // ✅ sorting correct
          teams = teams.sort(compare);
        }

        // ✅ SAFETY CHECK
        if (!teams.length) continue;

        // ✅ prize distribution
        for (let j = 0; j < contests[k].prizes.length; j++) {

          const prizeAmount = contests[k].prizes[j].amount;

          // ✅ index safety
          if (!teams[j] || !teams[j].userId) continue;

          const user = await User.findById(teams[j].userId);
          if (!user) continue;

          try {

            // ✅ only winner gets money
            if (prizeAmount > 0) {

              user.wallet += prizeAmount;

              await Transaction.create({
                userId: user?._id,
                amount: prizeAmount,
                action: "winnings",
                status: "completed",
                transactionId: contests[k]._id
              });

              user.totalAmountWon += prizeAmount;
            }

            await user.save();

            // ✅ notification
            if (user?.fcmtoken) {
              const message = {
                notification: {
                  title: "Match Result",
                  body:
                    prizeAmount > 0
                      ? `You won ₹${prizeAmount}! Check your wallet for details.`
                      : `Better luck next time`,
                },
                token: user.fcmtoken,
              };

              await messaging.send(message);
            }

          } catch (e) {
            console.log("USER ERROR:", e);
          }
        }
      }

      // ✅ IMPORTANT FIX: match transaction update AFTER ALL USERS
      try {
        await MatchLive.updateOne(
          { matchId: matches[i]?.matchId },
          {
            $set: {
              transaction: true,
            },
          }
        );
      } catch (e) {
        console.log("MATCH UPDATE ERROR:", e);
      }

    }
  }
};
