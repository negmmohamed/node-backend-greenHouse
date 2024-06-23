const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const cors = require("cors");
const authenticateJWT = require('../middlewares/jwtAuthentication');
const upload = require('../middlewares/uploadMiddleware');
const fs = require('fs');
const path = require('path');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

const userRouter = express.Router();
const users = [];
const otpStorage = {};

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const databaseName = 'sensors';
const collectionName = 'sensorreadings';

userRouter.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));



userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (user) {
    try {
      if (await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '50m' });
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);
        user.refreshToken = refreshToken;
        
        res.status(200).json({
          message: 'Logged in successfully',
          accessToken,
          refreshToken
        });
      } else {
        res.status(401).json({ message: "Incorrect email or password" });
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(401).json({ message: "User not found" });
  }
});

userRouter.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds
    const user = {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    };
    users.push(user);

    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '50m' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);
    user.refreshToken = refreshToken;

    res.status(201).json({
      message: "User registered successfully ƪ(˘⌣˘)ʃ",
      user,
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error(˘･_･˘)" });
  }
});

userRouter.post('/token', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { token } = req.body;
  if (!token) {
    return res.sendStatus(401);
  }

  const user = users.find(u => u.refreshToken === token);
  if (!user) {
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '50m' });
    res.json({ accessToken });
  });
});

userRouter.get('/dashboard', authenticateJWT, (req, res) => {
  res.send("Dashboard");
});

userRouter.get('/dashboard/control', authenticateJWT, (req, res) => {
  res.status(200).json({ message: "Dashboard Control" });
  console.log('Dashboard 200 OK');
});

userRouter.post('/upload-image', authenticateJWT, upload, (req, res) => {
  if (req.file) {
    console.log('File uploaded successfully:', req.file.path);
    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: req.file.path
    });
  } else {
    console.log('No file received');
    res.status(400).send('No file received');
  }
});

userRouter.get('/classificationimage',async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const resultsPath = path.join(__dirname, '../target_images/my_custom_results.json');
  const imagePath = path.join(__dirname, '../target_images/detected_image.jpg'); 

  if (fs.existsSync(resultsPath)) {
    const classificationResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

    if (fs.existsSync(imagePath)) {
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

// Sensor routes
async function getAllReadings() {
  try {
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);
    return await collection.find().toArray();
  } finally {
    await client.close();
  }
}

userRouter.get('/sensorReading', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const readings = await getAllReadings();
    res.json(readings);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching readings');
  }
});

// 
// 1...EDIT PROFILE 
userRouter.put('/editProfile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 2....CHANGE PASSWORD
userRouter.put('/changePassword', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (await bcrypt.compare(currentPassword, user.password)) {
      user.password = await bcrypt.hash(newPassword, 10);
      res.status(200).json({ message: 'Password changed successfully(◔◡◔)'});
    } else {
      res.status(401).json({ message: 'Current password is incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 3....OTP
userRouter.post('/forgotPassword', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);

  if (user) {
    const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false });
    otpStorage[email] = otp;

    // Send OTP via email (or any other method)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
      } else {
        res.status(200).json({ message: 'OTP sent successfully' });
      }
    });
  } else {
    res.status(404).json({ message: 'Email not found' });
  }
});

userRouter.post('/resetPassword', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const storedOtp = otpStorage[email];

  if (storedOtp === otp) {
    const user = users.find(u => u.email === email);
    if (user) {
      user.password = await bcrypt.hash(newPassword, 10);
      delete otpStorage[email];
      res.status(200).json({ message: 'Password reset successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

userRouter.delete("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = userRouter;
