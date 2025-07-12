// models/donation.js
const mongoose = require("mongoose");
const User=require("./user.js");
const Baitulmaal=require("./baitulmaal.js");

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  baitulmaal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Baitulmaal",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Donation", donationSchema);
