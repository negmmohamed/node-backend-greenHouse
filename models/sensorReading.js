const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sensorReadingSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  w_level: {   
    type: Number,
    required: true,
  },
  mq135: {
    sensorId: String, 
    type: Number,
    required: true,
  },
  ph: {
    type: Number,
    required: true,
  },
});

const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);

module.exports = SensorReading;
