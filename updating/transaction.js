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
   console.log("🔥 RUNNING TRANSACTION:", new Date()); // ✅ 1
  let date = new Date();
  const endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000 * 2);
  date = new Date(date.getTime() - 24 * 60 * 60 * 1000 * 2);

  const matches = await MatchLive.find({
    date: {
      $gte: new Date(date),
      $lt: new Date(endDate),
    },
  });
 console.log("TOTAL MATCHES:", matches.length); // ✅ 2
  for (let i = 0; i < matches.length; i++) {
    console.log("👉 MATCH ID:", matches[i].matchId); // ✅ 3
    console.log("👉 RESULT:", matches[i].result); // ✅ 4
    console.log("👉 TRANSACTION:", matches[i].transaction); // ✅ 5
    if (matches[i].result == "Complete" && !matches[i].transaction) {
      console.log("✅ MATCH ELIGIBLE FOR TRANSACTION"); // ✅ 6

      const contests = await Contest.find({ matchId: matches[i].matchId });
      console.log("🎯 CONTESTS FOUND:", contests.length); // ✅ 7
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
          console.log("👥 TEAMS COUNT:", teams.length); // ✅ 8
        // ✅ SAFETY CHECK
        if (!teams.length) continue;

        // ✅ prize distribution
        for (let j = 0; j < teams.length; j++) {
       console.log("🏆 PRIZE INDEX:", j); // ✅ 9
          console.log("🏆 PRIZE AMOUNT:", contests[k].prizes[j].amount); // ✅ 10
          const prizeAmount = contests[k].prizes[j].amount;
            if (prizeAmount <= 0) continue;
          // ✅ index safety
          if (!teams[j] || !teams[j].userId) continue;
         console.log("❌ TEAM OR USER NOT FOUND"); // ✅ 11
          const user = await User.findById(teams[j].userId);
          if (!user) continue;
           console.log("👤 USER ID:", teams[j].userId); // ✅ 12
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
          console.log("✅ WALLET UPDATED:", user.wallet); // ✅ 15
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
        console.log("✅ MATCH MARKED AS TRANSACTION DONE"); // ✅ 16
      } catch (e) {
        console.log("MATCH UPDATE ERROR:", e);
      }

    }
  }
};
