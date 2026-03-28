const ApiRequest = require("../models/apiRequest");
const Config = require("../models/config");
const RapidApiKey = require("../models/rapidapikeys");
const User = require("../models/user");

async function getUniversalKey(matchId = null) {
  try {
    const key = await RapidApiKey.findOne({
      type: "scores",
      status: "active",
    });

    if (key && key.apiKey) {
      return key.apiKey;
    }

    console.log("⚠️ DB key not found, using fallback");
    return "Np6lN6V8wU-9Q6Gl5kIUQH2jHJf8FgiT5zExTwR3SZzOzBav56";
  } catch (err) {
    console.error("❌ key error:", err.message);
    return "Np6lN6V8wU-9Q6Gl5kIUQH2jHJf8FgiT5zExTwR3SZzOzBav56";
  }
}

module.exports = {
  getkeys: getUniversalKey,
  squadkeys: getUniversalKey,
};
