const User=require("./models/user.js");
const Admin=require("./models/admin.js");


module.exports.isadmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'donor'){
    req.flash("error","unauthorised acess to Admin");
     return res.redirect("/home/donordashboard");
  }
  else if(req.isAuthenticated() && req.user.role==="admin")
{
  return next();
}
 else{
   req.flash("error", "Log in as admin first.");
  res.render("adminlogin.ejs");
 }
};

module.exports.donorisLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'donor') return next();

  req.flash("error", "You must be logged in as donor.");
  res.redirect("/home/login");
};
