
// const socketController = (io) => {
//   io.on('connection', (socket) => {
//     console.log("New client connected 🤔!");
//     console.log(`Client ID: ${socket.id}`);
    
//     socket.on('disconnect', () => {
//       console.log("Client disconnected 😱!");
//     });
    
//     socket.on('sensors_reads', (data) => {
//       try {
//         console.log('Received sensors_reads:', data);
//         socket.broadcast.emit('sensors_reads', data);
//       } catch (error) {
//         console.error('Error during sending sensor data:', error.message);
//       }
//     });
//   });
// };

//module.exports = socketController;

const SensorReading = require('../models/SensorReading'); 

const socketController = (io) => {
  io.on('connection', (socket) => {
    console.log("New client connected 🤔!");
    console.log(`Client ID: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log("Client disconnected 😱!");
    });
    
    socket.on('sensors_reads', async (data) => {
      try {
        console.log('Received sensors_reads:', data);
        
        // Validate the data
        const { ph, mq135, w_level, humidity, temperature } = data;
        const missingFields = [];
        socket.broadcast.emit('sensors_reads', data);
        
        if (ph === undefined || ph === null) missingFields.push('ph');
        if (mq135 === undefined || mq135 === null) missingFields.push('mq135');
        if (w_level === undefined || w_level === null) missingFields.push('w_level');
        if (humidity === undefined || humidity === null) missingFields.push('humidity');
        if (temperature === undefined || temperature === null) missingFields.push('temperature');
      
        if (missingFields.length > 0) {
          console.error(`Error: Missing required sensor data fields: ${missingFields.join(', ')}`);
          return; 
        }
        
        

        
        const newReading = new SensorReading({
          ph,
          mq135,
          w_level,
          humidity,
          temperature
        });

        await newReading.save();
        console.log('Sensor data saved successfully');
      } catch (error) {
        console.error('Error during sending sensor data:', error.message);
      }
    });
  });
};

module.exports = socketController;

