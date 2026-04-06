
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
          { rank: 1, amount: 10 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 2",
        description: "Description for Contest Type 1",
        prize: 34,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 20,
        prizes: [
          { rank: 1, amount: 34 },
          { rank: 2, amount: 0 },
        ],
      },

         {
        name: "Contest Type 3",
        description: "Description for Contest Type 1",
        prize: 56,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 33,
        prizes: [
          { rank: 1, amount: 56 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 4",
        description: "Description for Contest Type 1",
        prize: 85,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 50,
        prizes: [
          { rank: 1, amount: 85 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 5",
        description: "Description for Contest Type 1",
        prize: 142,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 84,
        prizes: [
          { rank: 1, amount: 142 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 6",
        description: "Description for Contest Type 1",
        prize: 170,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 100,
        prizes: [
          { rank: 1, amount: 170 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 7",
        description: "Description for Contest Type 1",
        prize: 212,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 125,
        prizes: [
          { rank: 1, amount: 212 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 8",
        description: "Description for Contest Type 1",
        prize: 425,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 250,
        prizes: [
          { rank: 1, amount: 425 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 9",
        description: "Description for Contest Type 1",
        prize: 595,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 350,
        prizes: [
          { rank: 1, amount: 595 },
          { rank: 2, amount: 0 },
        ],
      },

         {
        name: "Contest Type 10",
        description: "Description for Contest Type 1",
        prize: 799,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 470,
        prizes: [
          { rank: 1, amount: 799 },
          { rank: 2, amount: 0 },
        ],
      },

         {
        name: "Contest Type 11",
        description: "Description for Contest Type 1",
        prize: 1062,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 625,
        prizes: [
          { rank: 1, amount: 1062 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 12",
        description: "Description for Contest Type 1",
        prize: 1700,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 1000,
        prizes: [
          { rank: 1, amount: 1700 },
          { rank: 2, amount: 0 },
        ],
      },

         {
        name: "Contest Type 13",
        description: "Description for Contest Type 1",
        prize: 2397,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 1410,
        prizes: [
          { rank: 1, amount: 2397},
          { rank: 2, amount: 0 },
        ],
      },

         {
        name: "Contest Type 14",
        description: "Description for Contest Type 1",
        prize: 3213,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 1890,
        prizes: [
          { rank: 1, amount: 3213 },
          { rank: 2, amount: 0 },
        ],
      },

         {
        name: "Contest Type 15",
        description: "Description for Contest Type 1",
        prize: 5355,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 3150,
        prizes: [
          { rank: 1, amount: 5355 },
          { rank: 2, amount: 0 },
        ],
      },
         {
        name: "Contest Type 16",
        description: "Description for Contest Type 1",
        prize: 8075,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 4750,
        prizes: [
          { rank: 1, amount: 8075 },
          { rank: 2, amount: 0 },
        ],
      },

         {
        name: "Contest Type 17",
        description: "Description for Contest Type 1",
        prize: 10625,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 6250,
        prizes: [
          { rank: 1, amount: 10625 },
          { rank: 2, amount: 0 },
        ],
      },

        {
        name: "Contest Type 18",
        description: "Description for Contest Type 1",
        prize: 12495,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 7350,
        prizes: [
          { rank: 1, amount: 12495 },
          { rank: 2, amount: 0 },
        ],
      },
         {
        name: "Contest Type 19",
        description: "Description for Contest Type 1",
        prize: 14990,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 8995,
        prizes: [
          { rank: 1, amount: 14990 },
          { rank: 2, amount: 0 },
        ],
      },

         {
        name: "Contest Type 20",
        description: "Description for Contest Type 1",
        prize: 17
            000,
        totalSpots: 2,
        numWinners: 1,
        entryFee: 10000,
        prizes: [
          { rank: 1, amount: 17000 },
          { rank: 2, amount: 0 },
        ],
      },

    {
        name: "Contest Type 21",
        description: "Description for Contest Type 1",
        prize: 30,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 12,
        prizes: [
          { rank: 1, amount: 30 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

{
        name: "Contest Type 22",
        description: "Description for Contest Type 1",
        prize: 43,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 17,
        prizes: [
          { rank: 1, amount: 43 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

    {
        name: "Contest Type 23",
        description: "Description for Contest Type 1",
        prize: 86,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 34,
        prizes: [
          { rank: 1, amount: 86 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

    {
        name: "Contest Type 24",
        description: "Description for Contest Type 1",
        prize: 174,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 68,
        prizes: [
          { rank: 1, amount: 174 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

     {
        name: "Contest Type 25",
        description: "Description for Contest Type 1",
        prize: 346,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 136,
        prizes: [
          { rank: 1, amount: 346 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

     {
        name: "Contest Type 26",
        description: "Description for Contest Type 1",
        prize: 693,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 272,
        prizes: [
          { rank: 1, amount: 693 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

     {
        name: "Contest Type 27",
        description: "Description for Contest Type 1",
        prize: 1377,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 544,
        prizes: [
          { rank: 1, amount: 1377 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

     {
        name: "Contest Type 28",
        description: "Description for Contest Type 1",
        prize: 2774,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 1088,
        prizes: [
          { rank: 1, amount: 2774 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

    {
        name: "Contest Type 29",
        description: "Description for Contest Type 1",
        prize: 5548,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 2176,
        prizes: [
          { rank: 1, amount: 5548 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

    {
        name: "Contest Type 30",
        description: "Description for Contest Type 1",
        prize: 11096,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 4325,
        prizes: [
          { rank: 1, amount: 11096 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

    {
        name: "Contest Type 31",
        description: "Description for Contest Type 1",
        prize: 22055,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 8650,
        prizes: [
          { rank: 1, amount: 22055 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

    {
        name: "Contest Type 32",
        description: "Description for Contest Type 1",
        prize: 25500,
        totalSpots: 3,
        numWinners: 1,
        entryFee: 10000,
        prizes: [
          { rank: 1, amount: 25500 },
          { rank: 2, amount: 0 },
          { rank: 3, amount: 0 },
        ],
      },

    {
        name: "Contest Type 33",
        description: "Description for Contest Type 1",
        prize: 36,
        totalSpots: 4,
        numWinners: 2,
        entryFee: 10,
        prizes: [
          { rank: 1, amount: 20 },
          { rank: 2, amount: 16 },
          { rank: 3, amount: 0 },
          { rank: 4, amount: 0 },
        ],
      },

    {
        name: "Contest Type 34",
        description: "Description for Contest Type 1",
        prize: 68,
        totalSpots: 4,
        numWinners: 2,
        entryFee: 20,
        prizes: [
          { rank: 1, amount: 40 },
          { rank: 2, amount: 28 },
          { rank: 3, amount: 0 },
          { rank: 4, amount: 0 },
        ],
      },

    {
        name: "Contest Type 35",
        description: "Description for Contest Type 1",
        prize: 136,
        totalSpots: 4,
        numWinners: 2,
        entryFee: 40,
        prizes: [
          { rank: 1, amount: 80 },
          { rank: 2, amount: 56 },
          { rank: 3, amount: 0 },
          { rank: 4, amount: 0 },
        ],
      },

    {
        name: "Contest Type 36",
        description: "Description for Contest Type 1",
        prize: 340,
        totalSpots: 4,
        numWinners: 2,
        entryFee: 100,
        prizes: [
          { rank: 1, amount: 200 },
          { rank: 2, amount: 140 },
          { rank: 3, amount: 0 },
          { rank: 4, amount: 0 },
        ],
      },

    {
        name: "Contest Type 37",
        description: "Description for Contest Type 1",
        prize: 680,
        totalSpots: 4,
        numWinners: 2,
        entryFee: 200,
        prizes: [
          { rank: 1, amount: 450 },
          { rank: 2, amount: 230 },
          { rank: 3, amount: 0 },
          { rank: 4, amount: 0 },
        ],
      },

    {
        name: "Contest Type 38",
        description: "Description for Contest Type 1",
        prize: 1360,
        totalSpots: 4,
        numWinners: 2,
        entryFee: 400,
        prizes: [
          { rank: 1, amount: 900 },
          { rank: 2, amount: 460 },
          { rank: 3, amount: 0 },
          { rank: 4, amount: 0 },
        ],
      },

    {
        name: "Contest Type 39",
        description: "Description for Contest Type 1",
        prize: 2720,
        totalSpots: 4,
        numWinners: 2,
        entryFee: 800,
        prizes: [
          { rank: 1, amount: 1800 },
          { rank: 2, amount: 920 },
          { rank: 3, amount: 0 },
          { rank: 4, amount: 0 },
        ],
      },

    {
        name: "Contest Type 40",
        description: "Description for Contest Type 1",
        prize: 5100,
        totalSpots: 4,
        numWinners: 2,
        entryFee: 1500,
        prizes: [
          { rank: 1, amount: 4100 },
          { rank: 2, amount: 1000 },
          { rank: 3, amount: 0 },
          { rank: 4, amount: 0 },
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
