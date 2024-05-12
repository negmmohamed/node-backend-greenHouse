if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  
  const express = require("express");
  const app = express();
  const http = require('http');
  const server = http.createServer(app);
  const socketController = require('./config/socketController'); 
  const io = require('socket.io')(server, {
    cors: {
      origin: "*"
    }
  });
  const passport = require("passport");
  const flash = require("express-flash");
  const session = require("express-session");
  const methodOverride = require("method-override");
  const mongoose = require("mongoose");
  const sensorReading = require('./models/sensorReading')
  //const sensorRouter = require("./Routes/sensorRoutes.js");
  const upload = require("./middlewares/uploadMiddleware"); 
const watchTargetImagesFolder = require ("./middlewares/executePython")  
  // DB Connection
  mongoose.connect(process.env.MONGODB_URI)//, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('BD Connected successfully 🫡');
    })
    .catch((error) => {
      console.error('Error with connecting to the DB 😓:', error);
    });
  
  const initializePassport = require("./config/passportConfiguration");
  const { checkAuthenticated } = require("./middlewares/authMiddleware");
  
  const controllers = require('./config/controllers');
  
  app.set("view engine", "ejs");
  app.use(express.static(__dirname + "/public"));
  
  // ImplementPassportConfiguration
  const users = [];
  
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  );
  
  // Middleware setup
  app.use(express.urlencoded({ extended: false }));
  app.use(flash());
  app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(methodOverride("_method"));
  //app.use('/api/sensors', sensorRouter);
  
  //Classified-images
//   app.post('/classified-image', (req, res) => {
//     const imagePath = req.body.imagePath;
//     executePythonScript(imagePath, scriptPath, (classificationResults) => {
//         res.json(classificationResults);
//     });
// });

  //User routes
  const userRouter = require("./Routes/userRoutes");
  app.use("/", userRouter);
  // handle image upload
// app.post('/upload-image', upload.single('image'), (req, res) => {
//   // Handle the uploaded file here
//   console.log('File uploaded successfully');
//   res.send('File uploaded successfully');
// });
  watchTargetImagesFolder();
  
  app.get('/', checkAuthenticated, (req, res) => {
  });
  
  const port = 3000;
  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
  
  socketController(io);
  controllers(io);