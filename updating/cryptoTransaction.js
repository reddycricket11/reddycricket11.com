const mongoose = require("mongoose");
const Contest = require("../models/contest");
const Team = require("../models/team");
const MatchLive = require("../models/matchlive");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const { messaging } = require("../utils/firebaseinitialize");

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

          // ✅ FIXED SORTING (highest points first)
          function compare(a, b) {
            return b.points - a.points;
          }

          teams = teams.sort(compare);
        }

        // ✅ prizes field use करो
        for (let j = 0; j < contests[k].prizes.length; j++) {
          if (teams.length > 0 && teams[j]?.userId) {
            const user = await User.findById(teams[j].userId);
            if (!user) continue;

            const prizeAmount = contests[k].prizes[j].amount;

            // 💸 Wallet update (INR)
            user.wallet += prizeAmount;
            user.totalAmountWon += prizeAmount;

            try {
              await user.save();

              // 🧾 Transaction log
              await Transaction.create({
                userId: user._id,
                amount: prizeAmount,
                action: "winnings",
                status: "completed",
                transactionId: contests[k]._id
              });

              // 🔔 Notification
              if (user?.fcmtoken) {
                const message = {
                  notification: {
                    title: "Congratulations!",
                    body: `You won ₹${prizeAmount}! Check your wallet.`,
                  },
                  token: user.fcmtoken,
                };
                await messaging.send(message);
              }

              // ✅ Mark transaction done
              await MatchLive.updateOne(
                { matchId: matches[i]?.matchId },
                {
                  $set: {
                    transaction: true,
                  },
                }
              );

            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    }
  }
};
