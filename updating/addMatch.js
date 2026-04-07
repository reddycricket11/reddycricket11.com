const request = require("request");
const Match = require("../models/match");
const Contest = require("../models/contest");
const MatchLiveDetails = require("../models/matchlive");
const Series = require("../models/series");
const ContestType = require("../models/contestType");
const { getflag } = require("../utils/getflags");
const flagURLs = require("country-flags-svg");

function compare(a, b) {
  return Number(a.startDate) - Number(b.startDate);
}

module.exports.addMatchtoDb = async function () {
  console.log("add match");

  const obj = { results: [] };

  const options = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/upcoming",
    headers: {
      "x-apihub-key": process.env.CRICBUZZ_KEY,
      "x-apihub-host": "Cricbuzz-Official-Cricket-API.allthingsdev.co",
      "x-apihub-endpoint": "1943a818-98e9-48ea-8d1c-1554e116ef44",
    },
  };

  const promise = new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) return reject(error);
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });

  promise
    .then(async (s) => {
      if (!s?.typeMatches) return;

      for (const se of s.typeMatches) {
        for (const k of se.seriesMatches || []) {
          if (k?.seriesAdWrapper?.matches) {
            for (const f of k.seriesAdWrapper.matches) {
              if (f?.matchInfo) {
                obj.results.push(f.matchInfo);
              }
            }
          }
        }
      }

      // ✅ SORT ONCE
      obj.results.sort(compare);

      for (let i = 0; i < obj.results.length; i++) {
        const data = obj.results[i];
        const matchId = String(data.matchId);

        console.log(matchId, "processing");

        try {
          /* ===================== SERIES (FIXED) ===================== */
          if (!data.seriesId || !data.seriesName) {
            console.log("⛔ Series data missing, skipping match:", matchId);
            continue;
          }

          let seriesDoc = await Series.findOne({
            seriesId: data.seriesId,
          });

          if (!seriesDoc) {
            seriesDoc = await Series.create({
              seriesId: data.seriesId,
              name: data.seriesName,
              type:
                data.matchType === "league"
                  ? "league"
                  : data.matchType === "domestic"
                  ? "domestic"
                  : "international",
              date: data.seriesName,
              startDate: new Date(
                Number(data.seriesStartDt || data.startDate)
              ),
              endDate: new Date(
                Number(data.seriesEndDt || data.endDate)
              ),
              importance:
                data.matchFormat?.toLowerCase() === "t20"
                  ? "very_high"
                  : "medium",
            });

            console.log("✅ Series created:", data.seriesName);
          }

          /* ===================== MATCH ===================== */
          let match = await Match.findOne({ matchId });

          const match1 = match || new Match();

          match1.matchId = matchId;
          match1.matchTitle = data.matchDesc || data.seriesName;
          match1.seriesId = String(data.seriesId);
          match1.series = seriesDoc._id; // 🔴 MOST IMPORTANT FIX
          match1.format = data.matchFormat?.toLowerCase() || "t20";
          match1.importance =
            match1.format === "t20" ? "very_high" : "medium";

          match1.teamHomeName = data.team1.teamName.toLowerCase();
          match1.teamAwayName = data.team2.teamName.toLowerCase();
          match1.teamHomeId = String(data.team1.teamId);
          match1.teamAwayId = String(data.team2.teamId);

          match1.teamHomeCode = data.team1.teamSName.toLowerCase();
          match1.teamAwayCode = data.team2.teamSName.toLowerCase();

          match1.date = new Date(Number(data.startDate));
          match1.enddate = new Date(Number(data.endDate));

          const teamHomeFlagUrl =
            flagURLs.findFlagUrlByCountryName(
              data.team1.teamName.toLowerCase()
            ) || getflag(data.team1.teamName.toLowerCase());

          const teamAwayFlagUrl =
            flagURLs.findFlagUrlByCountryName(
              data.team2.teamName.toLowerCase()
            ) || getflag(data.team2.teamName.toLowerCase());

          match1.teamHomeFlagUrl =
            teamHomeFlagUrl ||
            "https://via.placeholder.com/150?text=Team+Logo";

          match1.teamAwayFlagUrl =
            teamAwayFlagUrl ||
            "https://via.placeholder.com/150?text=Team+Logo";

          /* ===================== CONTEST ===================== */
          if (!match) {
            const contestTypes = await ContestType.find({});

            for (let k = 0; k < contestTypes.length; k++) {
              const prizeDetails = contestTypes[k].prizes.map((p) => ({
                prize: p.amount,
                prizeHolder: "",
              }));

              const contest = await Contest.create({
                price: contestTypes[k].prize,
                totalSpots: contestTypes[k].totalSpots,
                spotsLeft: contestTypes[k].totalSpots,
                matchId: matchId,
                prizeDetails,
                numWinners: contestTypes[k].numWinners,
                entryFee: contestTypes[k].entryFee,
              });

              match1.contestId.push(contest._id);
            }

            await match1.save();
            console.log("✅ match added:", matchId);
          } else {
            await match1.save();
            console.log("🔁 match updated:", matchId);
          }
        } catch (err) {
          console.log("❌ Error:", err.message);
        }
      }
    })
    .catch((err) => {
      console.log("API Error:", err);
    });
};
