const path = require('path');
const fs = require('fs');
const MatchLiveDetails = require("../models/matchlive");
const Matches = require("../models/match");
const HARDCODED_KEY = "e51eca4b3e7649dbbc2cb1d250d9e020",
const Squad = require("../models/squad");
const fetch = require("node-fetch");
// const { getkeys } = require("../utils/crickeys"); // ❌ key DB se nahi leni
const db = require("../utils/firebaseinitialize");
const DetailScores = require("../models/detailscores");
const { fuzzyMatchVideo } = require("../utils/fuzzyMatchVideos");
const { findBestMatchingOver } = require("../utils/stringSimilar");
const Series = require('../models/series');
const axios = require('axios');

const oversJsonPath = path.join(__dirname, './../overs_with_clips.json');
const data = JSON.parse(fs.readFileSync(oversJsonPath, 'utf-8'));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.updateSquads = async function () {
  try {
    const now = Date.now();
    const date = new Date();

    const tenDaysLater = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);

    // 🔹 DB se series lana (unchanged)
    const ongoingSeries = await Series.find({
      $or: [
        { startDate: { $lte: now }, endDate: { $gt: now } },
        { startDate: { $gt: now, $lte: tenDaysLater } }
      ]
    }).sort({ startDate: 1 });

    console.log(`Found ${ongoingSeries.length} ongoing series`);

    for (const series of ongoingSeries) {
      const seriesId = series.seriesId;

      // ✅ SINGLE + CORRECT API CALL (HARDCODED KEY)
      const response = await axios.get(
        `https://blazerbob.com/cricbuzz/series/${seriesId}/squads`,
        {
          headers: {
           "x-auth-user": "e51eca4b3e7649dbbc2cb1d250d9e020",
          }
        }
      );

      await delay(1000);

      const squads = response?.data?.squads || [];

      for (const team of squads) {
        const { teamId, squadId } = team;
        const teamName = team?.squadType;

        if (!squadId) {
          console.warn(`No squadId for team ${teamName}`);
          continue;
        }

        // 🔹 Players extract
        const players = (team?.players || [])
          .filter(p => !p.isHeader)
          .map(p => ({
            playerId: p.id,
            playerName: p.name,
            position: p.role,
            image: p.imageId,
          }));

        // 🔹 DB save (unchanged behaviour)
        await Squad.findOneAndUpdate(
          { seriesId, teamId },
          {
            seriesId,
            teamId,
            squadId,
            teamName,
            players,
          },
          { upsert: true, new: true }
        );

        console.log(`✅ Saved squad for ${teamName} | series ${seriesId}`);
      }
    }
  } catch (err) {
    console.error("❌ Error in updateSquads:", err.message);
  }
};
