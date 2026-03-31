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

    // 👉 अगर दोनों false हैं तो skip
    if (!lineupMissing && !isAbandoned) continue;

    // 🔁 contest ढूंढो
    const contests = await Contest.find({
      matchId: match.matchId,
      refunded: { $ne: true }
    });

    for (const contest of contests) {
      // ✅ Safety: already refunded तो skip
      if (contest.refunded) continue;

      // ✅ सही entry fee (हर user का)
      const entryFee = contest.price;

      for (const userId of contest.userIds) {
        const user = await User.findById(userId);
        if (!user) continue;

        // 💸 REFUND
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

      contest.refunded = true;
      await contest.save();
    }

    // 🧹 match को cancelled mark कर दो
    match.status = "cancelled";
    await match.save();

    console.log("✅ Refund done for match:", match.matchId);
  }
};
