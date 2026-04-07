const axios = require("axios");
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
console.log("🔥 API CALL START");

let s;

try {
  const response = await axios.get(
    "https://blazerbob.com/cricbuzz/matches/upcoming",
    {
      headers: {
        "x-auth-user": "e51eca4b3e7649dbbc2cb1d250d9e020",
      },
      timeout: 10000,
    }
  );

  console.log("🌐 API HIT SUCCESS");

  s = response.data;

  console.log(
    "📦 DATA:",
    s?.typeMatches ? "MATCHES FOUND ✅" : "NO MATCHES ❌"
  );
 } catch (err) {
  console.log("❌ ERROR:", err.message);
}

      for (const se of s.typeMatches) {
         const matchType = se.matchType; // 🔥 IMPORTANT
        for (const k of se.seriesMatches || []) {
          if (k?.seriesAdWrapper?.matches) {
            for (const f of k.seriesAdWrapper.matches) {
              if (f?.matchInfo) {
                f.matchInfo.matchType = matchType; //
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
  entryFee: contestTypes[k].entryFee, 
  totalSpots: contestTypes[k].totalSpots,
  spotsLeft: contestTypes[k].totalSpots,
  matchId: matchId,
  prizeDetails,
  numWinners: contestTypes[k].numWinners,
 // 🔥 FIX: price सही बनाओ
  price: contestTypes[k].entryFee * contestTypes[k].totalSpots,
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
