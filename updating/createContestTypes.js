
const ContestType = require("../models/contestType");

module.exports.createDefaultContestTypes = async function createDefaultContestTypes() {
    const defaultContestTypes = [
      {
        name: "Contest Type 1",
        description: "Description for Contest Type 1",
        prize: 17,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 10,
        prizes: [
          { rank: 1, amount: 17 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },
      ];
      for (const contestType of defaultContestTypes) {
        const existingContestType = await ContestType.findOne({ name: contestType.name });
        if (!existingContestType) {
          await ContestType.create(contestType);
          console.log(`Created default contest type: ${contestType.name}`);
        }
      }
    }
