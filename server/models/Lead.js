const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    source: {
      type: String,
      default: "Website",
      trim: true,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Converted", "Not Interested"],
      default: "New",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    followUps: [followUpSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);