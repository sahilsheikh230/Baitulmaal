require("dotenv").config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path");
const ejsMate = require('ejs-mate');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Baitulmaal = require("./models/baitulmaal.js");
const Admin = require("./models/admin.js");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));


async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'public')));

//session
const sessionOptions = {
  secret: "hello",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));

//flash
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

// Admin login (custom strategy named 'admin')
passport.use('admin', new LocalStrategy(Admin.authenticate()));

// Unified serialize/deserialize
passport.serializeUser((user, done) => {
  done(null, { id: user._id, role: user.role }); 
});

passport.deserializeUser(async (obj, done) => {
  try {
    const Model = obj.role === 'admin' ? Admin : User;
    const user = await Model.findById(obj.id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.isAdmin = req.user?.role === 'admin';
  res.locals.isDonor = req.user?.role === 'donor';
  next();
});
app.use(async (req, res, next) => {
  if (req.session.baitulmaalid) {
    try {
      const baitulmaal = await Baitulmaal.findById(req.session.baitulmaalid);
      res.locals.currentBaitulmaal = baitulmaal;
    }
    catch (err) {
      console.log("cannot fetch baitulmaal", err);
    }

  }
  else {
    req.session.baitulmaalid = null;
  }
  next();

});


app.get("/",(req,res)=>{
  res.redirect("/home");
})

// Root
app.get('/home', (req, res) => {
  res.render('home.ejs');
});
// my routes
/*donor route*/
const donorRoutes = require("./routes/donorRoute.js");
app.use(donorRoutes);
/*adminroute*/
const adminRoutes = require("./routes/adminroute.js");
app.use(adminRoutes);
/*baitulmaal route*/
const baitulmaalroute = require("./routes/baitulmaalroute.js");
app.use(baitulmaalroute);
/*navbar routes*/
app.get('/about', (req, res) => {
  res.render('about.ejs');
});

app.get('/help', (req, res) => {
  res.render('help.ejs');
});

app.get('/getinvolved', (req, res) => {
  res.render('involved.ejs');
});
app.get("/contact",(req,res)=>{
  res.render("contact.ejs");
})
app.get("/feedback",(req,res)=>{
  res.render("feedback.ejs");
})
//ERROR HANDLER
app.use((err, req, res, next) => {
  const { message = "Something went wrong!" } = err;
  res.status(500).send(message);
});

const port = 3000;
const server=app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
server.setTimeout(5 * 60 * 1000);