const User=require("../models/user.js");
const Baitulmaal=require("../models/baitulmaal.js");
const Review=require("../models/Review.js");
const Report=require("../models/report.js");
const razorpayInstance = require("../utils/razorpay.js"); 
const Donation = require("../models/donation.js");
module.exports.donorsignup= (req, res) => {
  res.render("signup.ejs");
};
module.exports.donorPostSignup=async (req, res, next) => {
  try {
    const { email, username, password,phone,address } = req.body.User;
  
    const newUser = new User({ email, username, phone,address });
    const registeredUser = await User.register(newUser, password);
    
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome!");
      res.redirect("/home/donordashboard");
    });
  } catch (e) {
    next(e);
  }
};
module.exports.donorlogin= (req, res) => {
 if (req.isAuthenticated() && req.user.role === 'donor'){
  res.redirect("/home/donordashboard");
 }
 else{
  
  res.render("login.ejs");
 }
};
module.exports.donorPostLogin=(req, res) => {

  
  req.flash("success", "Welcome back!");
   res.redirect("/home/donordashboard");
  
};
module.exports.donorlogout=(req,res,next)=>{
  req.logout((err)=>{
    if(err){
    next(err);
    }
    req.flash("success","Logged Out successfully!");
    res.redirect("/home");
})
};
module.exports.donordashboard=async(req,res)=>{
  if(req.isAuthenticated() && req.user.role==="donor"){
  const baitulmaals=await Baitulmaal.find({});
  
  res.render("donordashboard.ejs",{baitulmaals});}
  else{
    req.flash("error","Log in first");
    res.render("login.ejs");
  }
};
module.exports.report=async(req,res)=>{
  let{id,userid}=req.params;
if(req.isAuthenticated() && req.user.role==="donor")
{

const baitulmaal=await Baitulmaal.findById(id);
const user=await User.findById(userid);
  res.render("report.ejs",{baitulmaal,user});
}
}
module.exports.submitreport=async(req,res)=>{
  
  let {id,userid}=req.params;
  let {message}=req.body.Review;
  try{

    const report = new Report({
      message,
      baitulmaal: id, 
      createdAt: new Date(),
      submittedBy:userid, 
    });

    await report.save(); 
  req.flash("success","Report submitted!")
  res.redirect("/home/donordashboard");
  }
  catch(err){
    req.flash("error","Cannot submit report !Try agin later")
    res.redirect("/home/donordashboard");
  }
};
module.exports.myReports = async (req, res) => {
  if(req.isAuthenticated() && req.user.role==="donor"){
  const { userid } = req.params;
  const reports = await Report.find({ submittedBy: userid })
    .populate("baitulmaal")
    .sort({ createdAt: -1 });
  res.render("donorReports.ejs", { reports });
  }
  else{
    req.flash("error","Log IN As Donor");
    res.redirect("/home");
  }
};
module.exports.getdonationform=async(req,res)=>{
  let {id}=req.params;

  if(req.isAuthenticated() && req.user.role==="donor"){
    const baitulmaal=await Baitulmaal.findById(id);
   res.render("donationform.ejs", { baitulmaal, razorpayKey: process.env.RAZORPAY_KEY_ID });

  }
  else{
    req.flash("error","LOg in");
    res.redirect("/home");
  }
}


module.exports.razorpaydonation = async (req, res) => {
  const { amount } = req.body;
  const { id } = req.params;
  console.log("Using Razorpay ID:", process.env.RAZORPAY_KEY_ID);
  const options = {
    amount: amount * 100,  // amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      baitulmaalId: id
    }
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Razorpay error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


module.exports.saveDonation = async (req, res) => {
  try {
    const { paymentId, amount, baitulmaalId } = req.body;
    const newDonation = new Donation({
      donor: req.user._id,
      baitulmaal: baitulmaalId,
      amount,
      paymentId
    });

    await newDonation.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to save donation:", err);
    res.status(500).json({ success: false, error: "Could not save donation." });
  }
};

module.exports.donordonationview=async(req,res)=>{
  let{baitulmaalid}=req.params;
  try{
  const donations=await Donation.find({donor:req.user._id,baitulmaal:baitulmaalid}).populate("baitulmaal").sort({ createdAt: -1 });
  console.log(donations);
    res.render("donordonation.ejs",{donations});
  }
    catch (err) {
    console.error("Error fetching donations:", err);
    req.flash("error", "Failed to load donations.");
    res.redirect("/home/donordashboard");
  }
}