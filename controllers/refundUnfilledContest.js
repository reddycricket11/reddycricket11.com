
const Match = require("../models/match");
const MatchLive = require("../models/matchlive");
const Contest = require("../models/contest");
const User = require("../models/user");
const Transaction = require("../models/transaction");

module.exports.refundUnfilledContest = async () => {
  try {
    const liveMatches = await MatchLive.find({});

    for (const live of liveMatches) {
      const match = await Match.findOne({ matchId: live.matchId });
      if (!match) continue;

      // ❗ delay match → skip
      if (match.status === "delayed") continue;

      // ✅ toss check (IMPORTANT)
     // const tossDone = live.tossWinner && live.tossDecision;
    //  if (!tossDone) continue;

      // ⏱ match start time
      const matchStart = new Date(match.date);
      const now = new Date();

      const diff = (now - matchStart) / (1000 * 60);

      // ⏳ 5 min wait
    //  if (diff < 1) continue;

      const contests = await Contest.find({
        matchId: match.matchId,
        refunded: { $ne: true }
      });
      console.log("🔥 TOTAL CONTEST:", contests.length);

      for (const contest of contests) {
        const contests = await Contest.find({
  matchId: match.matchId,
  refunded: { $ne: true }
});

console.log("🔥 TOTAL CONTEST:", contests.length);

for (const contest of contests) {

  console.log("👉 CHECK CONTEST:", contest._id);
  console.log("SPOTS LEFT:", contest.spotsLeft);
  console.log("USERS:", contest.userIds?.length);
  console.log("REFUNDED:", contest.refunded);

  if (contest.spotsLeft === 0 || contest.refunded) continue;

  // ❗ full या already refunded → skip
  if (contest.spotsLeft === 0 || contest.refunded) continue;

  // ❗ empty contest → skip + mark refunded
  if (!contest.userIds || contest.userIds.length === 0) {
    await Contest.updateOne(
    { _id: contest._id },
    { $set: { refunded: true } }
  );
    continue;
  }
const updated = await Contest.updateOne(
  { _id: contest._id, refunded: { $ne: true } },
  { 
    $set: { 
      refunded: true,
      isCancelled: true   // 🔥 ADD THIS
    } 
  }
);

if (updated.modifiedCount === 0) continue;
        // 💸 refund users
        for (const userId of contest.userIds) {
          const user = await User.findById(userId);
          if (!user) continue;

          user.wallet += contest.entryFee;
          await user.save();

          await Transaction.create({
            userId,
            amount: contest.entryFee,
            action: "refund",
            status: "completed",
            transactionId: contest._id
          });
        }

        console.log("✅ Refund done:", contest._id);
      }
    }
  } catch (err) {
    console.log("❌ Refund Error:", err);
  }
};
