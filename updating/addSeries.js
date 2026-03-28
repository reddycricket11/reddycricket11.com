const axios = require("axios");
const Series = require("../models/series");

/**
 * ✅ NEW CRICBUZZ OFFICIAL API CONFIG
 */
const API_CONFIG = {
  baseURL: "https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co",
  headers: {
    "x-apihub-key": "Np6lN6V8wU-9Q6Gl5kIUQH2jHJf8FgiT5zExTwR3SZzOzBav56",
    "x-apihub-host": "Cricbuzz-Official-Cricket-API.allthingsdev.co",
    "x-apihub-endpoint": "661c6b89-b558-41fa-9553-d0aca64fcb6f",
  },
};

/**
 * ⚠️ SAME FUNCTION
 * logic intentionally empty
 */
async function fetchSeriesByType(type) {
  try {
    console.log(`ℹ️ Skipping remote fetch for type: ${type}`);
    return [];
  } catch (error) {
    console.error(`❌ Error (${type}):`, error.message);
    return [];
  }
}

/**
 * ✅ SAME updateSeries function
 * NO LOGIC CHANGE
 */
module.exports.updateSeries = async function () {
  try {
    const types = ["international", "league", "domestic", "women"];

    for (const type of types) {
      console.log(`🔄 Fetching series: ${type}`);

      const seriesData = await fetchSeriesByType(type);

      for (const seriesObj of seriesData) {
        if (!seriesObj.series) continue;

        for (const series of seriesObj.series) {
          const { id, name, startDt, endDt } = series;
          if (!id || !name) continue;

          const startDate = new Date(Number(startDt));
          const endDate = new Date(Number(endDt));

          const seriesPayload = {
            seriesId: id,
            name,
            date: `${startDate.toLocaleString("default", {
              month: "long",
            })} ${startDate.getFullYear()}`,
            startDate,
            endDate,
            type,
          };

          const exists = await Series.findOne({ seriesId: id });

          if (!exists) {
            await Series.create(seriesPayload);
            console.log(`✅ Added series: ${name} (${type})`);
          }
        }
      }
    }

    console.log("🎉 Series data update completed.");
  } catch (err) {
    console.error("🔥 updateSeries failed:", err);
  }
};
