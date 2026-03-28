module.exports.isInPlay = function isInPlay(
  r,
  date,
  overs = 0,
  runs = 0
) {
  const result = r?.toLowerCase();

  // ❌ Match खत्म या रुका हुआ
  if (
    result === "complete" ||
    result === "completed" ||
    result === "abandon" ||
    result === "abandoned" ||
    result === "stumps" ||
    result === "innings break" ||
    result === "delay" ||
    result === "lunch"
  ) {
    return false;
  }

  // ❌ Toss / lineup हो गया लेकिन ball start नहीं हुई
  if (overs === 0 && runs === 0) {
    return false;
  }

  // ✅ First ball के बाद ही LIVE
  return true;
};
