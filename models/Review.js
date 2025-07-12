const mongoose = require("mongoose");
const Baitulmaal = require("./baitulmaal.js");
const Admin = require("./admin.js");

const reviewSchema = new mongoose.Schema({
  baitulmaal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baitulmaal',
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  message: {
    type: String,
    required: true
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
