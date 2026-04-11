const cron = require("node-cron");
const { startTransaction } = require("./transaction.js");
const { addMatchtoDb } = require("./addMatch.js");
const { addLivescoresDetails } = require("./addlivescoresdetails.js");
const { refundUnfilledContest } = require('../controllers/refundUnfilledContest');
const { addLiveDetails } = require("./addlivedetails.js");
const { addLivecommentary } = require("./addCommentary.js");
const { addTeamstandingstodb } = require("./updateteam.js");
const { addTeamstandingstodbAPI } = require("./updatestandings.js");
const { addPlayersAPI } = require("./addplayer.js");
const { addteamPlayers } = require("./teamcreatecontroller.js");
const { addMatchIds } = require("./addMatchIds.js");
const { updateBalls } = require("./updateBalls.js");
const { addInPlayStatus } = require("./addInPlayStatus.js");
const { addLivescoresDetailsCustom } = require("./addlivescoresdetailskeys.js");
const { addLivecommentaryCustom } = require("./addCommentaryCustom.js");
const { startCryptoTransaction } = require("./cryptoTransaction.js");
const { addLivescoresDetailsCustomfs } = require("./addScoredetailsCustom.js");
const { updateSeries } = require("./addSeries.js");
const { updateSquads } = require("./updateSquads.js");
const { addLiveDetailsFS } = require("./addlivedetailsFS.js");
const config = require("../models/config.js");
const { addInPlayStatusFS } = require("./addInPlayStatusFS.js");
const { addLivecommentaryMongo } = require("./addCommentaryMongo.js");
const { resetPlayerNotifiedFlags } = require("./resetNotifiedFlags.js");


const isSource = process.env.SOURCE === "true";

let jobs = {}; // store references to all cron jobs

function getCronPattern(minutes) {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `*/${seconds} * * * * *`; // seconds-level cron
  }
  return `*/${minutes} * * * *`;
}

console.log(getCronPattern(0.5), 'pattern')

// Stop all existing cron jobs
function stopAllJobs() {
  for (let key in jobs) {
    jobs[key]?.stop();
    delete jobs[key];
  }
  console.log("🛑 All cron jobs stopped");
}

// Schedule all cron jobs dynamically
async function scheduleJobs(frequencies) {
  stopAllJobs();

  jobs.teamPlayers = cron.schedule("0 */6 * * *", async () => {
  console.log("📡 Players API running...");
  await addteamPlayers();
});

  // General jobs (always run)
  jobs.startTransaction = cron.schedule("*/2 * * * *", async () => {
    await startTransaction()
  });

  jobs.startCryptoTransaction = cron.schedule("*/5 * * * * *", async () => {
    await startCryptoTransaction()
  });

  jobs.teamStandingsUpdate = cron.schedule("*/2 * * * *", async () => {
  await addTeamstandingstodb()
});

jobs.resetPlayerFlags = cron.schedule("0 0 * * *", async () => {
  await resetPlayerNotifiedFlags()
});

  // 👇 यहाँ डाल
  jobs.refundMatches = cron.schedule("*/10 * * * *", async () => {
    console.log("💸 Refund cron running...");
    await refundAbandonedMatches();
  });

  // ✅ NEW: unfilled contest refund
jobs.refundUnfilled = cron.schedule("*/10 * * * *", async () => {
  console.log("💸 Unfilled Contest Refund running...");
  await refundUnfilledContest();
});

  // Source mode jobs
  if (isSource) {
    jobs.liveDetails = cron.schedule("*/15 * * * * *", async () => {
      await addLiveDetails()
    })
    jobs.inPlayStatus = cron.schedule("*/10 * * * * *", async () => {
      await addInPlayStatus()
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    jobs.test = cron.schedule(getCronPattern(frequencies.test), async () => {
      await addLivescoresDetailsCustom("test");
    });

    jobs.odi = cron.schedule(getCronPattern(frequencies.odi), async () => {
      await addLivescoresDetailsCustom("odi");
    });

    jobs.t20 = cron.schedule(getCronPattern(frequencies.t20), async () => {
      await addLivescoresDetailsCustom("t20");
    });

    jobs.high = cron.schedule(getCronPattern(frequencies.high), async () => {
      await addLivescoresDetailsCustom("high");
    });

    jobs.very_high = cron.schedule(getCronPattern(frequencies.very_high), async () => {
      await addLivescoresDetailsCustom("very_high");
    });

    jobs.low = cron.schedule(getCronPattern(frequencies.low), async () => {
      await addLivescoresDetailsCustom("low");
    });
    
    console.log("✅ Cron jobs scheduled for source mode");
  } else {
    // Non-source mode
    jobs.liveDetailsFS = cron.schedule("*/5 * * * *", async () => {
      await addLiveDetailsFS();
    });
    jobs.inPlayStatusFS = cron.schedule("*/10 7-23 * * *", async () => {
      await addInPlayStatusFS()
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });
    jobs.testFS = cron.schedule(getCronPattern(frequencies.test), async () => {
      await addLivescoresDetailsCustomfs("test");
    });
    jobs.odiFS = cron.schedule(getCronPattern(frequencies.odi), async () => {
      await addLivescoresDetailsCustomfs("odi");
    });
    jobs.t20FS = cron.schedule(getCronPattern(frequencies.t20), async () => {
      await addLivescoresDetailsCustomfs("t20");
    });

    jobs.high = cron.schedule(getCronPattern(frequencies.high), async () => {
      await addLivescoresDetailsCustomfs("high");
    });

    jobs.very_high = cron.schedule(getCronPattern(frequencies.very_high), async () => {
      await addLivescoresDetailsCustomfs("very_high");
    });

    jobs.low = cron.schedule(getCronPattern(frequencies.low), async () => {
      await addLivescoresDetailsCustomfs("low");
    });
    console.log("ℹ️ Cron jobs scheduled for non-source mode");
  }

  // Other periodic jobs
  jobs.addMatchDb = cron.schedule("*/10 * * * * *", async () => {
  await addMatchtoDb();
});

  jobs.updateSeriesSquads = cron.schedule("0 */2 * * *", async () => {
  await updateSeries();
  await updateSquads();
});
  
  jobs.playersMaster = cron.schedule("10 */2 * * *", async () => {
  await addPlayersAPI();
});

  jobs.teamStandings = cron.schedule("*/30 * * * *", async () => {
  await addTeamstandingstodb();
});

  
  jobs.addMatchIds = cron.schedule("*/5 * * * *", async () => {
  await addMatchIds();
});
}

// Initialize cron jobs on startup
async function cronjobs() {
  const cfg = await config.findOne();
  console.log(cfg?.frequencies, 'frequencies')
  const frequencies = cfg?.frequencies || { t20: 2, odi: 5, test: 15, important: 1 };
  await scheduleJobs(frequencies);
}

module.exports = { cronjobs, scheduleJobs };
