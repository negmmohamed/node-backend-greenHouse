const controllers = (io) => {

    let fanState = 'off'; 
    let pump2State = 'off';
    let pump1State = 'off'; 
    let ledState = 'off';

    const debugMode = false;  

    io.on('connection', (socket) => {
        console.log('New client connected');


        socket.on('control_fan', (data) => {
            if (data && data.action) {
                if (data.action === 'open') {
                    console.log('Opening the fan');
                    fanState = 'on';
                    io.emit('fan_state', fanState);
                    socket.broadcast.emit('fan_on');
                } else if (data.action === 'close') {
                    console.log('Closing the fan');
                    fanState = 'off';
                    io.emit('fan_state', fanState);
                    socket.broadcast.emit('fan_off');
                }
            } else if (debugMode) {
                console.log('Invalid data received for fan control:', data);
            }
        });

        socket.on('control_pump1', (data) => {
            if (data && data.action) {
                if (data.action === 'on') {
                    console.log('Turning on pump1');
                    pump1State = 'on';
                    io.emit('pump1_state', pump1State);
                    socket.broadcast.emit('pump1_on');
                } else if (data.action === 'off') {
                    console.log('Turning off pump1');
                    pump1State = 'off';
                    io.emit('pump1_state', pump1State);
                    socket.broadcast.emit('pump1_off');
                }
            } else if (debugMode) {
                console.log('Invalid data received for pump1 control:', data);
            }
        });


        socket.on('control_pump2', (data) => {
            if (data && data.action) {
                if (data.action === 'on') {
                    console.log('Turning on pump2');
                    pump2State = 'on';
                    io.emit('pump2_state', pump2State);
                    socket.broadcast.emit('pump2_on');
                } else if (data.action === 'off') {
                    console.log('Turning off pump2');
                    pump2State = 'off';
                    io.emit('pump2_state', pump2State);
                    socket.broadcast.emit('pump2_off');
                }
            } else if (debugMode) {
                console.log('Invalid data received for pump2 control:', data);
            }
        });


        socket.on('control_led', (data) => {
            if (data && data.action) {
                if (data.action === 'on') {
                    console.log('Turning on led');
                    ledState = 'on';
                    io.emit('led_state', ledState);
                    socket.broadcast.emit('led_on');
                } else if (data.action === 'off') {
                    console.log('Turning off led');
                    ledState = 'off';
                    io.emit('led_state', ledState);
                    socket.broadcast.emit('led_off');
                }
            } else if (debugMode) {
                console.log('Invalid data received for LED control:', data);
            }
        });

        socket.on('event_name', (data) => {
            if (data && data.action) {
                if (data.action === 'on') {
                    console.log('Move Solar Panel To Right');
                    socket.broadcast.emit('motor_right');
                } else if (data.action === 'off') {
                    console.log('Move Solar Panel To Left');
                    socket.broadcast.emit('motor_left');
                }
            } else if (debugMode) {
                console.log('Invalid data received for solar panel control:', data);
            }
        });

        
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        
        socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    });
};

module.exports = controllers;
