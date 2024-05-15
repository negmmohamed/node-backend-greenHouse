const express = require("express");
const { checkAuthenticated, checkNotAuthenticated } = require("../middlewares/authMiddleware");
const argon2 = require("argon2");  
const passport = require("passport");
const upload = require('../middlewares/uploadMiddleware');
const fs = require('fs');
const path = require('path');
//const app = express();
const userRouter = express.Router();

const io = require("socket.io")
const users = [];

const initializePassport = require("../config/passportConfiguration");
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id),
  users
);

// Configuring the login post functionality
userRouter.post("/login", checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

// Configuring the register post functionality
userRouter.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await argon2.hash(req.body.password); 
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    console.log(users); 

  } catch (error) {
    console.log(error);
  }
});

// Routes
userRouter.get('/', checkAuthenticated, (req, res) => {
});

userRouter.get('/login', checkNotAuthenticated, (req, res) => {
});

userRouter.get('/register', checkNotAuthenticated, (req, res) => {
});

// For dashboard and all its components
userRouter.get('/dashboard', checkAuthenticated, (req, res) => {
});

userRouter.get('/dashboard/control', checkAuthenticated, (req, res) => {
});

userRouter.get('/dashboard/Classification', checkAuthenticated, (req, res) => {
});

// userRouter.get('/dashboard/Report', checkAuthenticated, (req, res) => {
// });

// serve (send) the classified image and results to WEB & MOBBILE

userRouter.get('/classificationimage', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const resultsPath = path.join(__dirname, '../target_images/my_custom_results.json');
  const imagePath = path.join(__dirname, '../target_images/detected_image.jpg'); 

  if (fs.existsSync(resultsPath)) {
    const classificationResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

    if (fs.existsSync(imagePath)) {
      // Read the image file and convert it to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');

      const response = {
        classificationResults: classificationResults,
        imageName: imageBase64
      };
      res.json(response);
    } else {
      res.status(404).send('Detected image not found');
    }
  } else {
    res.status(404).send('Results not found');
  }
});


// Logout route
userRouter.delete("/logout", (req, res) => {
  req.logout(req.user, err => {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = userRouter;