const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    
     entryFee: {
  type: Number,
  required: true,
},

    totalSpots: {
      type: Number,
      required: true,
    },

    numWinners: {
      type: Number,
      required: true,
    },

    spotsLeft: {
      type: Number,
      required: true,
    },

    // 👇 ADD THIS
isFull: {
  type: Boolean,
  default: false
},

    // 👇 YAHAN ADD KAR
order: {
  type: Number,
  default: 0
},

    teamsId: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    matchId: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },

    prizeDetails: [
      {
        prize: {
          type: Number,
        },
        prizeHolder: {
          type: String,
        },
      },
    ],

    admin: {
      type: String,
      trim: true,
      lowercase: true,
      default: "Server-Domino-Beton",
    },
    
    isDistributed: {
  type: Boolean,
  default: false,
},

    userIds: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

   refunded: {
      type: Boolean,
      default: false,
    },

    // ✅ सही जगह यहाँ
    isCancelled: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contest", contestSchema);
