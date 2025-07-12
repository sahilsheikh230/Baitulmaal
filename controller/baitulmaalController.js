
const Baitulmaal=require("../models/baitulmaal.js");
const sendVerificationCode = require("../sendEmail"); 
const Review=require("../models/Review.js");

const Donation=require("../models/donation.js");
const streamifier = require("streamifier"); 

const uploadBase64ToCloudinary = (base64, folder) => {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(base64.split(',')[1], 'base64');
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
module.exports.baitulmaalregisterpage=(req,res)=>{
  res.render("register.ejs");
};

const cloudinary = require("cloudinary").v2;

module.exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      references,
      phoneVerified,
      emailVerified,
      liveWithAadhaarData,
    } = req.body.Baitulmaal;

    // Check duplicates
    const [existingName, existingEmail, existingPhone] = await Promise.all([
      Baitulmaal.findOne({ name }),
      Baitulmaal.findOne({ email }),
      Baitulmaal.findOne({ phone }),
    ]);

    if (existingName) {
      req.flash("error", "Organization name already exists.");
      return res.redirect("/home/register");
    }
    if (existingEmail) {
      req.flash("error", "Email already registered.");
      return res.redirect("/home/register");
    }
    if (existingPhone) {
      req.flash("error", "Phone number already registered.");
      return res.redirect("/home/register");
    }

    if (phoneVerified !== "true" || emailVerified !== "true") {
      req.flash("error", "Phone and email must be verified.");
      return res.redirect("/home/register");
    }

    // Validate uploaded files
    const aadhaarFile = req.files?.["aadhaarCard"]?.[0];
    const documentFile = req.files?.["document"]?.[0];

    if (!aadhaarFile || !aadhaarFile.path) {
      req.flash("error", "Aadhaar card upload failed.");
      return res.redirect("/home/register");
    }

    if (!documentFile || !documentFile.path) {
      req.flash("error", "Islamic verification document upload failed.");
      return res.redirect("/home/register");
    }

    if (!liveWithAadhaarData || !liveWithAadhaarData.startsWith("data:image/")) {
      req.flash("error", "Live photo with Aadhaar is required.");
      return res.redirect("/home/register");
    }
    console.log("Live Photo base64 length:", liveWithAadhaarData?.length || 0);
console.log("Base64 starts with:", liveWithAadhaarData?.substring(0, 30));


    // Upload to Cloudinary
    const [aadhaarUpload, documentUpload, liveUpload] = await Promise.all([
      cloudinary.uploader.upload(aadhaarFile.path, { folder: "aadhaarCards" }),
      cloudinary.uploader.upload(documentFile.path, { folder: "islamicDocuments" }),
          uploadBase64ToCloudinary(liveWithAadhaarData, "liveWithAadhaar")
    ]);

    // Save to DB
    const newBaitulmaal = new Baitulmaal({
      name,
      email,
      phone,
      address,
      references,
      phoneVerified,
      emailVerified,
      aadhaarCard: {
        url: aadhaarUpload.secure_url,
        public_id: aadhaarUpload.public_id,
      },
      document: {
        url: documentUpload.secure_url,
        public_id: documentUpload.public_id,
      },
      liveWithAadhaar: {
        url: liveUpload.secure_url,
        public_id: liveUpload.public_id,
      },
    });

    await newBaitulmaal.save();

    req.session.baitulmaalid = newBaitulmaal._id;
    res.redirect("/home/verification");

  } catch (err) {
    console.error("Registration Error:", err);
    req.flash("error", "Registration failed. Please try again.");
    res.redirect("/home/register");
  }
};



module.exports.baitulmaalverification=async(req,res)=>{

  if (!req.session.baitulmaalid) {
    req.flash("error", "No Baitulmaal registered.");
    return res.redirect("/home/register");
  }

  const baitulmaal = await Baitulmaal.findById(req.session.baitulmaalid);
const review=await Review.findOne({baitulmaal:req.session.baitulmaalid});
  res.render("verify", { baitulmaal,review });
 }
 module.exports.loginbaitulmaal= (req, res) => {
  res.render("baitulmaallogin.ejs");
};
module.exports.loginbaitulmaalPost=async (req, res) => {
  const { name, phone } = req.body.Baitulmaal;

  try {
    const baitulmaal = await Baitulmaal.findOne({ name, phone });

    if (!baitulmaal) {
      req.flash("error", "Invalid name or phone number");
      return res.redirect("/home/loginbaitulmaal");
    }

    req.session.baitulmaalid = baitulmaal._id;
    req.flash("success", "Logged in successfully!");
    if(!baitulmaal.isverified){
    res.redirect("/home/verification");
    }else{

      res.redirect(`/home/baitulmaaldashboard/${baitulmaal._id}`);
    }

  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/home/loginbaitulmaal");
  }
};
module.exports.baitulmaaldashboard= async (req, res) => {
  try {
    const { id } = req.params;
    const baitulmaal = await Baitulmaal.findById(id);
const donations=await Donation.find({baitulmaal:id}).populate("baitulmaal").populate("donor");
    if (!baitulmaal) {
      req.flash("error", "Baitulmaal not found");
      return res.redirect("/home");
    }
    if(baitulmaal.isverified){

    res.render("baitulmaaldashboard.ejs", { baitulmaal,donations});
    }
    else{
      if(baitulmaal.status==="Rejected"){

const review=await Review.findOne({baitulmaal:baitulmaal._id});
    req.flash("error","Admin rejected your baitulmaal");
      res.render("verify.ejs",{baitulmaal,review});

      }
      else{
      const review=await Review.findOne({baitulmaal:baitulmaal._id});
      res.render("verify.ejs",{baitulmaal,review});
      }

    }

  } catch (err) {
    console.error("Error fetching Baitulmaal:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/home");
  }
};
module.exports.sendotp= async (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  try {
    const otp = await sendVerificationCode(email);
    // Optional: store `otp` in DB or session
    res.json({ success: true, message: "OTP sent to email",otp}); 
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};
module.exports.baitulmaallogout=async(req,res)=>{
  if(req.session.baitulmaalid){
    req.session.baitulmaalid=null;
    req.flash("success","Logged out Successfully");
    res.redirect("/home/loginbaitulmaal");
  }
  else{
    req.flash("error","you are not logged in");
      return res.redirect("/home/loginbaitulmaal");
  }
};
module.exports.geteditbaitulmaal=async(req,res)=>{
  if(req.session.baitulmaalid){
  let {id}=req.params;
  const baitulmaal=await Baitulmaal.findById(id);
  req.flash("success","Edit the baitulmaal");
  res.render("editbaitulmaal.ejs",{baitulmaal});
  }
  else{
    req.flash("error","Login Your Baitulmaal ");
    res.redirect("/home/loginbaitulmaal");
  }
};


module.exports.editbaitulmaal = async (req, res) => {
  const { id } = req.params;

  if (!req.session.baitulmaalid) {
    req.flash("error", "Login Your Baitulmaal");
    return res.redirect("/home/loginbaitulmaal");
  }

  const { name, email, phone, address, references } = req.body.Baitulmaal;

  

  try {
    const updated = await Baitulmaal.findByIdAndUpdate(id, {
      name,
      email,
      phone,
      address,
      references,
      status: "Submitted"
    }, { new: true });

    req.flash("success", "Baitulmaal details updated successfully.");
    res.redirect("/home/verification"); 
  } catch (err) {
    console.error(err);
    req.flash("error", "Error updating Baitulmaal.");
    res.redirect("/home/register");
  }
};


module.exports.deleteBaitulmaal = async (req, res) => {
  const { id } = req.params;

  if (!req.session.baitulmaalid) {
    req.flash("error", "Login Your Baitulmaal");
    return res.redirect("/home/loginbaitulmaal");
  }

  try {
const baitulmaal=    await Baitulmaal.findByIdAndDelete(id);
    req.flash("success", "Baitulmaal deleted successfully.");
    res.redirect("/home"); 
  } catch (err) {
    console.error(err);
    req.flash("error", "Error deleting Baitulmaal.");
    res.redirect("/home");
  }
};
