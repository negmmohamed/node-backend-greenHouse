const controllers = (io) => {
  
    let fanState = 'off'; 
    let pump2State = 'off';
    let pump1State = 'off'; 
    let ledState = 'off';
  
    io.on('connection', (socket) => {
      socket.on('control_fan', (data) => {
        if (data.action === 'open') {
            console.log('Opening the fan');
            fanState = 'on';
            io.emit('fan_state',fanState);
            socket.broadcast.emit('fan_on');
        } else if (data.action === 'close') {
            console.log('Closing the fan');
            fanState ='off';
            io.emit('fan_state',fanState);
            socket.broadcast.emit('fan_off');
        }
    });
  
    socket.on('control_pump1', (data) => {
        if (data.action === 'on') {
            console.log('Turning on pump1');
            pump1State = 'on';
            io.emit('pump1_state',pump1State);
            socket.broadcast.emit('pump1_on');
        } else if (data.action === 'off') {
            console.log('Turning off pump1');
            pump1State = 'off';
            io.emit('pump1_state',pump1State);
            socket.broadcast.emit('pump1_off');
        }
    });
    
  socket.on('control_pump2', (data) => {
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
  });
  
    socket.on('control_led', (data) => {
        if (data.action === 'on') {
            console.log('Turning on led');
            ledState ='on';
            io.emit('led_state',ledState);
            socket.broadcast.emit('led_on');
        } else if (data.action === 'off') {
            console.log('Turning off led');
            ledState = 'off';
            io.emit('led_state',ledState);
            socket.broadcast.emit('led_off');
        }
    });
    });
  };
  
  module.exports = controllers;
  //How to run shell script file using node 