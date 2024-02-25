var express = require("express");
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");
const postModel = require("./post");
const post = require("./post");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});
router.get("/register", function (req, res, next) {
  res.render("register", { nav: false });
});

router.post("/register", function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    name: req.body.fullname,
    email: req.body.email,
    contact: req.body.contact,
  });

  userModel.register(data, req.body.password, function (err, user) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

// for loging in  and checking the credentials
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
  }),
  function (req, res, next) {}
);

//logout
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    res.redirect("/", { nav: false });
  });
});

// logged in

function loggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.get("/profile", loggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  .populate("posts");
  console.log(user);
  res.render("profile", { user,nav:true });
});
router.get("/show/posts", loggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  .populate("posts");
  console.log(user);
  res.render("show", { user,nav:true });
});
router.get("/add", loggedIn, async function (req, res, next) {
  const user = await userModel
  .findOne({ username: req.session.passport.user });

  res.render("add", { user,nav:true });
});

router.get("/feed", loggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const posts= await postModel.find()
  .populate("user");

  res.render("feed", { user,posts,nav:true });
});



router.post(
  "/fileupload",
  loggedIn,
  upload.single("image"),

  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);
router.post("/createpost", loggedIn,upload.single("postimage") ,async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename
  });
user.posts.push(post._id)
await user.save();
res.redirect("/profile")
});

module.exports = router;
