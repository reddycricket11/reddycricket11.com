const ApiRequest = require("../models/apiRequest");
const RapidApiKey = require("../models/rapidapikeys");

async function getUniversalKey(matchId) {
  const key = await RapidApiKey.findOne({ status: "active" });

  if (!key || !key.apiKey) {
    console.log("❌ No active API key found");
    return null;
  }

  if (matchId) {
    await ApiRequest.create({
      matchId,
      apiKey: key.apiKey
    });
  }

  return key.apiKey;
}

module.exports = {
  getkeys: getUniversalKey,
  squadkeys: getUniversalKey
};
