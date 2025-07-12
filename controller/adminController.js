const Admin=require("../models/admin.js");
const Baitulmaal=require("../models/baitulmaal.js");
const Review=require("../models/Review.js");
const Donation=require("../models/donation.js");
const Report=require("../models/report.js");

module.exports.adminlogin=(req,res)=>{
   if (req.isAuthenticated() && req.user.role === 'admin'){
  res.redirect("/home/admindashboard");
 }
 else{
  res.render("adminlogin.ejs");
 }
 };
 module.exports.adminpost= (req, res) => {
  res.redirect("/home/admindashboard");
};
 module.exports.adminlogout=(req,res)=>{
  req.logout(()=>{
    res.redirect("/admin/login");
  })
};
module.exports.admindashboard=async(req,res,next)=>{
   const baitulmaals=await Baitulmaal.find({});
   const length=baitulmaals.length;
   let count=0;
   let rejectedcount=0;
  for(let i of baitulmaals){
    if(!(i.isverified)){
count=count+1;

    }
    if(i.status==="Rejected"){
rejectedcount++;
    }
  }

res.render("admindashboard.ejs",{baitulmaals,count,length,rejectedcount});
};
module.exports.adminview=async(req,res)=>{
  let{id}=req.params;
  const baitulmaal=await Baitulmaal.findById(id);
  res.render("view.ejs",{baitulmaal});
};
module.exports.adminreview=async(req,res)=>{
  let {id}=req.params;
  const baitulmaal=await Baitulmaal.findByIdAndUpdate(id,{status:"UnderReview"});
 const rejectedcount = req.session.rejectedcount;
  res.redirect(`/admin/${id}`);
};
module.exports.admincontact=async(req,res)=>{
  let {id}=req.params;
  const baitulmaal=await Baitulmaal.findByIdAndUpdate(id,{status:"Contacted"});
  
  res.redirect(`/admin/${id}`);
};
module.exports.adminapprove=async(req,res)=>{
  let {id}=req.params;
  const baitulmaal=await Baitulmaal.findByIdAndUpdate(id,{status:"Approved",isverified:true});
 
  res.redirect(`/admin/${id}`);
};
module.exports.adminreject = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body.Review;

  try {
    await Review.create({
      baitulmaal: id,
      reviewer: req.user._id,
      message: message
    });

    await Baitulmaal.findByIdAndUpdate(id, { status: "Rejected" });
   


    req.flash("success", "Rejection message submitted.");
    rejectedcount=rejectedcount+1;
    res.redirect(`/admin/${id}`,);
  } catch (err) {
    console.error("Rejection Error:", err);
    req.flash("error", "Failed to reject the Baitulmaal.");
    res.redirect(`/admin/${id}`);
  }
};
module.exports.viewreports=async(req,res)=>{
  if(req.isAuthenticated() && req.user.role==="admin"){

  const reports=await Report.find({}).populate("baitulmaal").populate("submittedBy");
  res.render("adminreport.ejs",{reports});
  }
  else{
    req.flash("error","Log in first");
    res.redirect("/admin/login");
  }
}
module.exports.replytoreport = async (req, res) => {
  const { reportId } = req.params;
  const { adminReply } = req.body.Report;

  if (!req.isAuthenticated() || req.user.role !== "admin") {
    req.flash("error", "Unauthorized access");
    return res.redirect("/admin/login");
  }

  if (!adminReply || adminReply.length < 20) {
    req.flash("error", "Reply must be at least 20 characters.");
    return res.redirect("/admin/viewreports");
  }

  try {
    await Report.findByIdAndUpdate(reportId, {
      adminReply,
      replyAt: new Date(),
    });
    req.flash("success", "Reply sent.");
    res.redirect("/admin/viewreports");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not send reply.");
    res.redirect("/admin/viewreports");
  }
};
module.exports.viewAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({})
      .populate("donor")
      .populate("baitulmaal")
      .sort({ createdAt: -1 });

    res.render("admindonation.ejs", { donations });
  } catch (err) {
    console.error(" Error fetching donations:", err);
    req.flash("error", "Unable to load donations.");
    res.redirect("/home/admindashboard");
  }
};