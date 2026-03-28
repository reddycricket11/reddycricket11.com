const mongoose = require("mongoose");

const rapidApiKeySchema = new mongoose.Schema(
  {
    apiKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0,
      set: v => (Number.isFinite(v) ? v : 0), // 🛡️ NaN protection
    },

    lastUsed: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    type: {
      type: String,
      enum: ["scores", "lineups", "matches"],
      default: "scores",
    },
  },
  { timestamps: true }
);

// 🔥 Performance index (important)
rapidApiKeySchema.index({ type: 1, status: 1, usageCount: 1, lastUsed: 1 });

const RapidApiKey = mongoose.model("RapidApiKey", rapidApiKeySchema);
module.exports = RapidApiKey;
