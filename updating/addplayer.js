
const axios = require("axios");
const Match = require("../models/match");
const { getkeys } = require("../utils/crickeys");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports.addPlayersAPI = async function () {
  let date = new Date();
  const endDate = new Date(date.getTime() + 202 * 60 * 60 * 1000);
  date = new Date(date.getTime());
  const matches = await Match.find({
    date: {
      $gte: new Date(date),
      $lt: new Date(endDate),
    },
  });
  console.log(matches?.length, 'found matches')
  for (let i = 0; i < matches.length; i++) {
    const arr_a = [];
    const arr = [];
    let keys = await getkeys();
    console.log(keys, 'keys')
   if (
  matches[i].teamHomeId &&
  matches[i].teamAwayId
) {
      console.log(matches[i]?.teamHomeId, 'founde matches')
      const options = {
        method: "get",
        url: `https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/team/${matches[i].teamHomeId}/players`,
        headers: {
          "x-apihub-key": 'Np6lN6V8wU-9Q6Gl5kIUQH2jHJf8FgiT5zExTwR3SZzOzBav56',
          "x-apihub-host": "Cricbuzz-Official-Cricket-API.allthingsdev.co",
          "x-apihub-endpoint": "2b298a5d-fb51-4e29-aa15-c5385291fcd8",
        },
      };

      try {
        await delay(1000);
        const response = await axios.request(options);
        let position;
        const players = response.data.player;
        for (let i = 0; i < players?.length; i++) {
          const check =
            players[i].name == "BATSMEN" ||
            players[i].name == "BOWLER" ||
            players[i].name == "ALL ROUNDER" ||
            players[i].name == "WICKET KEEPER";
          if (check) {
            position = players[i].name;
          } else {
            const a = {
              playerId: players[i].id,
              playerName: players[i].name,
              image: players[i].imageId,
              position,
              batOrder: -1,
            };
            arr.push(a);
          }
        }
      } catch (error) {
       // console.error(error);
      }
      keys = await getkeys();
      const options_two = {
        method: "get",
        url: `https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/team/${matches[i].teamAwayId}/players`,
        headers: {
          "x-apihub-key": 'Np6lN6V8wU-9Q6Gl5kIUQH2jHJf8FgiT5zExTwR3SZzOzBav56',
          "x-apihub-host": "Cricbuzz-Official-Cricket-API.allthingsdev.co",
          "x-apihub-endpoint": "2b298a5d-fb51-4e29-aa15-c5385291fcd8",
        },
      };

      try {
        await delay(1000)
        //keys = await getkeys.getkeys();
        const response = await axios.request(options_two);
        let position;
        console.log("Away players count:", response.data?.player?.length);
        const players = response.data.player;
        for (let i = 0; i < players?.length; i++) {
          const check =
            players[i].name == "BATSMEN" ||
            players[i].name == "BOWLER" ||
            players[i].name == "ALL ROUNDER" ||
            players[i].name == "WICKET KEEPER";
          if (check) {
            position = players[i].name;
          } else {
            const a = {
              playerId: players[i].id,
              playerName: players[i].name,
              image: players[i].imageId,
              position,
              batOrder: -1,
            };
            arr_a.push(a);
          }
        }
      } catch (error) {
  console.error("Away team API error:", error.message);
}
      try {
        console.log(arr, arr_a, 'matchteamer')
        let m = await Match.updateOne({ matchId: matches[i].matchId }, { teamAwayPlayers: arr_a, teamHomePlayers: arr });
        console.log(m,'matchteam')
      } catch (error) {
  console.error("Away team API error:", error.message);
      }
    }
  }
};
