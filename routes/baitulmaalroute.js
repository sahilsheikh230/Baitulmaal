const express = require("express");
const app = express();
const router = express.Router();
const passport=require("passport");
const baitulmaalController=require("../controller/baitulmaalController");
const multer = require("multer");
const { storage } = require('../utils/cloudinary.js');
const upload = multer({ storage });
const methodOverride = require("method-override");
app.use(methodOverride("_method"));



/*register Baitulmaal*/
router.route("/home/register")
.get(baitulmaalController.baitulmaalregisterpage)
.post(upload.fields([
  { name: "aadhaarCard", maxCount: 1 },
  { name: "document", maxCount: 1 },
])

,baitulmaalController.register);

/*dashboard baitulmaal*/

 router.get("/home/verification",baitulmaalController.baitulmaalverification);




// GET Login Page for Baitulmaal
router.route("/home/loginbaitulmaal") 
.get(baitulmaalController.loginbaitulmaal)
.post(baitulmaalController.loginbaitulmaalPost);

/*baitulmaal dashboard*/
router.get("/home/baitulmaaldashboard/:id", baitulmaalController.baitulmaaldashboard);
router.get("/home/logoutbaitulmaal",baitulmaalController.baitulmaallogout);
router.post("/home/send-otp", baitulmaalController.sendotp);
router.route("/home/editbaitulmaal/:id")
.get(baitulmaalController.geteditbaitulmaal)
.put(upload.single("document"),baitulmaalController.editbaitulmaal);
router.delete("/home/deletebaitulmaal/:id", baitulmaalController.deleteBaitulmaal);

module.exports=router;