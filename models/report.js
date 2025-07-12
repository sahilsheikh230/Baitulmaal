const mongoose = require("mongoose");
const Baitulmaal=require("../models/baitulmaal.js");
const User=require("../models/user.js");
const reportSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 20
  },
  baitulmaal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Baitulmaal",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  submittedBy: {
    type:  mongoose.Schema.Types.ObjectId,
    ref:"User",
required:true,
  },
  adminReply:{
    type:String,
  }
 
});

module.exports = mongoose.model("Report", reportSchema);
