const express = require("express");
const app = express();
const router = express.Router();
const User=require("../models/user.js");
const passport=require("passport");
const donorController=require("../controller/donorController.js");
const razorpay=require("../utils/razorpay.js");
const  {donorisLoggedIn}=require("../middleware.js");
router.route("/home/signup")
.get(donorController.donorsignup)
.post( donorController.donorPostSignup);


router.route("/home/login")
.get(donorController.donorlogin)
.post( passport.authenticate("local", {
  failureRedirect: "/home/login",
  failureFlash: true,
}),donorController.donorPostLogin);




router.get("/home/logout",donorisLoggedIn,donorController.donorlogout);
router.get("/home/donordashboard",donorController.donordashboard);
router.route("/home/reportbaitulmaal/:id/:userid")
.get (donorController.report)
.post(donorController.submitreport);
router.get("/home/donordashboard/reports/:userid", donorController.myReports);
router.route("/home/donate/:id")
.get(donorController.getdonationform)
.post(donorController.razorpaydonation)
// In donorRoute.js
router.post("/home/donation/success", donorisLoggedIn, donorController.saveDonation);
router.route("/home/viewdonations/:baitulmaalid")
.get(donorisLoggedIn,donorController.donordonationview)

module.exports=router;