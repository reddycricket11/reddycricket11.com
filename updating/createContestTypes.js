const ContestType = require("../models/contestType");

module.exports.createDefaultContestTypes = async function createDefaultContestTypes() {
    const defaultContestTypes = [
const defaultContestTypes = [
  {
    name: "Contest Type 1",
    description: "Description for Contest Type 1",
    prize: 17,
    totalSpots: 2,
    numWinners: 1,
    entryFee: 10,
    prizeDetails: [
      { rank: 1, prize: 17 }
    ],
  },
  {
    name: "Contest Type 2",
    description: "Description for Contest Type 2",
    prize: 17,
    totalSpots: 2,
    numWinners: 2,
    entryFee: 10,
    prizeDetails: [
      { rank: 1, prize: 18 }
    ],
  },
  {
    name: "Contest Type 3",
    description: "Description for Contest Type 3",
    prize: 17,
    totalSpots: 2,
    numWinners: 2,
    entryFee: 10,
    prizeDetails: [
      { rank: 1, prize: 5 },
      { rank: 2, prize: 7 }
    ],
  },
  {
    name: "Contest Type 4",
    description: "Description for Contest Type 4",
    prize: 40,
    totalSpots: 4,
    numWinners: 3,
    entryFee: 20,
    prizeDetails: [
      { rank: 1, prize: 20 },
      { rank: 2, prize: 12 },
      { rank: 3, prize: 8 }
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
