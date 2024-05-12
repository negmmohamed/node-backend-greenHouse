// const SensorReading = require('../models/sensorReading');

const socketController = (io) => {
    io.on('connection', (socket) => {
        console.log("New client connected 🤔!");
        console.log(`Client ID: ${socket.id}`);
        
        socket.on('disconnect', () => {
            console.log("Client disconnected 😱!");
        });
        
        socket.on('sensors_reads', (data) => {
            try {
                console.log('Received sensors_reads:', data);
                //  const sensorReading = new SensorReading(data);
                //  sensorReading.save();
                //  socket.broadcast.emit('sensors_reads', data);
            } catch (error) {
                console.error('Error during sending sensor data:', error.message);
            }
        });
});

}; 
module.exports = socketController;