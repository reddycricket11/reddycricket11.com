const request = require("request");
const MatchLive = require("../models/matchlive");
const {getkeys} = require("../utils/crickeys");



module.exports.addTeamstandingstodbAPI = async function () {
  try{
  const date = new Date();
  const endDate = date;
  const matches = await MatchLive.find();
  for (let i = 0; i < matches.length; i++) {
    const { matchId } = matches[i];
    const keys = await getkeys();
    const options = {
      method: "GET",
      url: `https://blazerbob.com/cricbuzz/match/${matchId}`,
      headers: {
        "x-rapidapi-host": "cricket-live-data.p.rapidapi.com",
        "x-auth-user": "e51eca4b3e7649dbbc2cb1d250d9e020",
        useQueryString: true,
      },
    };
    const promise = new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error);
        }
        const s = JSON.parse(body);

        resolve(s);
      });
    });
    promise.then(async (s) => {
      // STEP 1: API safety check
if (!s || !s.results) {
  console.log("❌ Invalid API response", matchId);
  return;
}
      // STEP 2: Match complete है तो LIVE logic मत चलाओ
if (
  s.results.match_status === "Complete" ||
  s.results.is_match_complete === true ||
  !s.results.live_details
) {
  console.log("⏭️ Match complete / no live_details:", matchId);
  return;
}

      const match = await MatchLive.findOne({ matchId });
      if (!match) {
  console.log("❌ Match not found in DB:", matchId);
  return;
}
      // 🔥 RESET points before recalculation
if (match.teamHomePlayers) {
  for (let i = 0; i < match.teamHomePlayers.length; i++) {
    match.teamHomePlayers[i].points = 0;
  }
}

if (match.teamAwayPlayers) {
  for (let i = 0; i < match.teamAwayPlayers.length; i++) {
    match.teamAwayPlayers[i].points = 0;
  }
}

      const batting = s?.results?.live_details?.scorecard?.[0]?.batting || [];
      for (const x of batting) {
        for (let i = 0; i < match.teamHomePlayers.length; i++) {
          if (
            parseInt(match.teamHomePlayers[i].playerId) ===
            parseInt(x.player_id)
          ) {
            match.teamHomePlayers[i].points =
  (match.teamHomePlayers[i].points || 0) +
  x.runs + 1 * x.fours + 2 * x.sixes;
            match.teamHomePlayers[i].runs = x.runs;
            match.teamHomePlayers[i].balls = x.balls;
            match.teamHomePlayers[i].fours = x.fours;
            match.teamHomePlayers[i].sixes = x.sixes;
            match.teamHomePlayers[i].strikeRate = x.strike_rate;
          }
        }
      }
      const batting2 = s?.results?.live_details?.scorecard?.[1]?.batting || [];
      for (const x of batting2) {
        for (let i = 0; i < match.teamAwayPlayers.length; i++) {
          if (
            parseInt(match.teamAwayPlayers[i].playerId) ===
            parseInt(x.player_id)
          ) {
           match.teamAwayPlayers[i].points =
  (match.teamAwayPlayers[i].points || 0) +
  x.runs + 1 * x.fours + 2 * x.sixes;
            match.teamAwayPlayers[i].runs = x.runs;
            match.teamAwayPlayers[i].balls = x.balls;
            match.teamAwayPlayers[i].fours = x.fours;
            match.teamAwayPlayers[i].sixes = x.sixes;
            match.teamAwayPlayers[i].strikeRate = x.strike_rate;
          }
        }
      }
      const bowling1 =
  s?.results?.live_details?.scorecard?.[0]?.bowling || [];

for (const x of bowling1) {
  for (let i = 0; i < match.teamAwayPlayers.length; i++) {
    if (
      parseInt(match.teamAwayPlayers[i].playerId) ===
      parseInt(x.player_id)
    ) {
      match.teamAwayPlayers[i].overs = x.overs;
      match.teamAwayPlayers[i].maidens = x.maidens;
      match.teamAwayPlayers[i].runsConceded = x.runs_conceded;
      match.teamAwayPlayers[i].wickets = x.wickets;
      match.teamAwayPlayers[i].economy = x.economy;
      match.teamAwayPlayers[i].points =
        (match.teamAwayPlayers[i].points || 0) + x.wickets * 25;
    }
  }
}
      const bowling2 =
  s?.results?.live_details?.scorecard?.[1]?.bowling || [];

for (const x of bowling2) {
  for (let i = 0; i < match.teamHomePlayers.length; i++) {
    if (
      parseInt(match.teamHomePlayers[i].playerId) ===
      parseInt(x.player_id)
    ) {
      match.teamHomePlayers[i].overs = x.overs;
      match.teamHomePlayers[i].maidens = x.maidens;
      match.teamHomePlayers[i].runsConceded = x.runs_conceded;
      match.teamHomePlayers[i].wickets = x.wickets;
      match.teamHomePlayers[i].economy = x.economy;
      match.teamHomePlayers[i].points =
        (match.teamHomePlayers[i].points || 0) + x.wickets * 25;
    }
  }
}

      const y = await match.save();
    });
  }
}
catch(error){
  console.log(error)
}
};
