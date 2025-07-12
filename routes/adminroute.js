const express = require("express");
const app = express();
const router = express.Router();
const adminController=require("../controller/adminController");
 const passport=require("passport");
 const{isadmin}=require("../middleware.js");
 
 
 
 
 
 
 router.route("/admin/login")
 .get(isadmin,adminController.adminlogin)
 .post( passport.authenticate("admin", {
  failureRedirect: "/admin/login",
}),  adminController.adminpost);
 
 
 router.get("/admin/viewreports", adminController.viewreports);
router.post("/admin/logout",adminController.adminlogout);
/*admin dashboard*/
 router.get("/home/admindashboard",isadmin,adminController.admindashboard);
/*admin view baitulmaal*/
router.get("/admin/:id",adminController.adminview);
router.post("/admin/:id/review",adminController.adminreview);
router.post("/admin/:id/contact",adminController.admincontact);
router.post("/admin/:id/approve",adminController.adminapprove);
router.post("/admin/:id/reject",adminController.adminreject);
router.post("/admin/reply/:reportId/:baitulmaalId", adminController.replytoreport);
router.get("/home/admin/donations", isadmin, adminController.viewAllDonations);

module.exports=router;