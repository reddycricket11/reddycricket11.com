/**
 * Twitter पूरी तरह OFF रखा गया है
 * कोई API call नहीं होगी
 * कोई error / crash नहीं आएगा
 */

require("dotenv").config();
const fs = require("fs");

const TWITTER_ENABLED = false; // 🔴 PERMANENT OFF

// =====================
// SAFE NO-OP FUNCTIONS
// =====================

async function sendTweet(text) {
  if (!TWITTER_ENABLED) {
    console.log("🚫 Twitter OFF → sendTweet skipped");
    return null;
  }
}

async function sendTweetWithVideo(text, videoPath) {
  if (!TWITTER_ENABLED) {
    console.log("🚫 Twitter OFF → sendTweetWithVideo skipped");
    return null;
  }
}

async function sendTweetWithImage(text, imagePath) {
  if (!TWITTER_ENABLED) {
    console.log("🚫 Twitter OFF → sendTweetWithImage skipped");
    return null;
  }
}

async function sendTweetWithPoll(
  text,
  options = ["Option 1", "Option 2"],
  durationMinutes = 1440
) {
  if (!TWITTER_ENABLED) {
    console.log("🚫 Twitter OFF → sendTweetWithPoll skipped");
    return null;
  }
}

// =====================
// EXPORTS
// =====================

module.exports = {
  sendTweet,
  sendTweetWithVideo,
  sendTweetWithImage,
  sendTweetWithPoll,
};
