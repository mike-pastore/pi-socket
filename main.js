var PORT = process.env.PORT || 3000;
var express = require('express');  //web server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);	//web socket server
var moment = require('moment');

// var SerialPort = require("serialport").SerialPort;
// var serialPort = new SerialPort("/../../sys/class/leds/led0", { baudrate: 115200 });

server.listen(PORT, function () {
	console.log('Server started!');
});

app.use(express.static('public'));

var brightness = 0; //static variable to hold the current brightness

// log timestamp for server start
var serverStartTime = moment();

io.sockets.on('connection', function (socket) { //gets called whenever a client connects

	// log timestamp for server start
	var clientStartTime = moment();

    // log difference between Client and Server start times
    var diffTime = serverStartTime.fromNow();

    socket.emit('led', {
    	value: brightness,
    	serverStartTime: serverStartTime.format('MMMM Do YYYY, h:mm:ss a'),
        clientStartTime: clientStartTime.format('MMMM Do YYYY, h:mm:ss a'),
        diffTime: diffTime
    }); //send the new client the current brightness
    
    socket.on('led', function (data) { //makes the socket react to 'led' packets by calling this function
        brightness = data.value;  //updates brightness from the data object
        // var buf = new Buffer(1); //creates a new 1-byte buffer
        // buf.writeUInt8(brightness, 0); //writes the pwm value to the buffer
        // serialPort.write(buf); //transmits the buffer to the pi

        io.sockets.emit('led', {
        	value: brightness
        }); //sends the updated brightness to all connected clients
    });
});