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
const cors = require('cors');
const mongoose = require("mongoose");

const watchTargetImagesFolder = require("./middlewares/executePython");

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('DB Connected successfully 🫡');
  })
  .catch((errorrrrr) => {
    console.error('Error with connecting to the DB 😓:', errorrrrr);
  });

const controllers = require('./config/controllers');

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//const SensorReading = require('./models/sensorReading');


app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// User routes
const userRouter = require("./Routes/userRoutes");
app.use("/", userRouter);

watchTargetImagesFolder();

app.get('/', (req, res) => {
  res.send("Welcome to the home page!");
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}🌐`);
});

socketController(io);
controllers(io);
