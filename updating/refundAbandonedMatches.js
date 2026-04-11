const Match = require("../models/match");
const MatchLive = require("../models/matchlive");
const Contest = require("../models/contest");
const User = require("../models/user");
const Transaction = require("../models/transaction");

module.exports.refundAbandonedMatches = async function () {
  const now = new Date();

  // ⏰ match start के 2 घंटे बाद
  const cutoff = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  // 🔍 ऐसे match जिनका time निकल गया
  const matches = await Match.find({ date: { $lt: cutoff } });

  for (const match of matches) {
    const live = await MatchLive.findOne({ matchId: match.matchId });

    // ❌ match live नहीं हुआ OR lineup नहीं आई
const lineupMissing =
  !live ||
  !live.teamHomePlayers?.length ||
  !live.teamAwayPlayers?.length;

// ✅ match cancelled / abandoned / no result
const isAbandoned =
  match.status === "cancelled" ||
  match.status === "abandoned" ||
  match.status === "no result";

// ✅ NEW: match start नहीं हुआ
const isNotStarted =
  !live ||
  (live.result !== "In Progress" && live.result !== "Complete");

// ✅ FINAL CONDITION (नीचे होना चाहिए)
if (!isNotStarted && !isAbandoned) continue;
    
    // 🔁 contest ढूंढो
    const contests = await Contest.find({
      matchId: match.matchId,
      refunded: { $ne: true }
    });

    for (const contest of contests) {

      // ❗ empty contest skip
if (!contest.userIds || contest.userIds.length === 0) {
  await Contest.updateOne(
    { _id: contest._id },
    { $set: { refunded: true, isCancelled: true } }
  );
  continue;
}

  const updated = await Contest.updateOne(
    { _id: contest._id, refunded: { $ne: true } },
    { $set: { refunded: true, isCancelled: true } }
  );

  if (updated.modifiedCount === 0) continue;

  const entryFee = contest.entryFee;

  for (const userId of contest.userIds) {
    const user = await User.findById(userId);
    if (!user) continue;

    user.wallet += entryFee;
    await user.save();

    await Transaction.create({
      userId,
      amount: entryFee,
      action: "refund",
      status: "completed",
      transactionId: contest._id
    });
  }
}

// ✅ अब यहाँ (loop के बाहर)
match.status = "cancelled";
await match.save();

console.log("✅ Refund done for match:", match.matchId);
     } // 🔥 for (const match of matches) loop end
};
