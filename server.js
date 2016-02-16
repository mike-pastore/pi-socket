var PORT = process.env.PORT || 3000;
var express = require('express');  //web server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);	//web socket server
var moment = require('moment');
var Forecast = require('forecast');
var hex2rgb = require('hex2rgb');

// 2/10 REMOVE ARDUINO for time being
// serial port & jsonscraper for arduino
// var SerialPort = require("serialport").SerialPort;
// var arduino = new SerialPort("/dev/cu.usbmodem1411", {
//   baudrate: 9600
// });
// var scraper = require('json-scrape')();

// 2/10 REMOVE ARDUINO for time being
// function updateArduino (hex) {
//   arduino.on('data', function (indata) {
//     //console.log(indata.toString());

//     // convert bgColor to rgb
//     rgbColor = hex2rgb(hex).rgb;
//     console.log('hex version = ' + hex);
//     console.log('rgb version = ' + rgbColor);
//     // scraper.write(indata.toString()); 
//     arduino.write('{"red": "' + rgbColor[0] + '"}');
//     arduino.write('{"green": "' + rgbColor[1] + '"}');
//     arduino.write('{"blue": "' + rgbColor[2] + '"}');
//   });
// }

// scraper.on('data', function (cleandata) {
//     console.log(cleandata);
//     console.log('Blue = ' + cleandata.blue);
// });

// instantiate forecast, cache every 1 minute
var forecast = new Forecast({
  service: 'forecast.io',
  key: '09bd150d2ba59dd9b1ea51469e932e8f',
  units: 'f', 
  cache: true,
  ttl: {
    minutes: 1
  }
});

server.listen(PORT, function () {
	console.log('Server started!');
});

app.use(express.static('public'));

//static variable to hold the current brightness
var brightness = 0; 

// log timestamp for server start
var serverStartTime = moment();

// instantiate weather vars
var weatherSummary,
    temperature,
    weatherIcon;

// instantiate bgColor from clients (hex)
var bgColor;

// instantiate rgb version of bgColor for arduino (rgb)
var rgbColor = [];

//gets called whenever a client connects
io.sockets.on('connection', function (socket) { 

	// log timestamp for server start
	var clientStartTime = moment();

    // log difference between Client and Server start times
    var diffTime = serverStartTime.fromNow();

    // pull current weather
    forecast.get([41.9290292, -87.7131625], function(err, weather) {
      if(err) return console.log(err);
      
      weatherSummary = weather.currently.summary;
      temperature = weather.currently.temperature;
      weatherIcon = weather.currently.icon;
    });

    //send the new client info
    socket.emit('led', {
    	value: brightness,
    	serverStartTime: serverStartTime.format('MMMM Do, h:mm:ss a'),
        clientStartTime: clientStartTime.format('MMMM Do, h:mm:ss a'),
        diffTime: diffTime,
        weatherSummary: weatherSummary,
        temperature: temperature,
        weatherIcon: weatherIcon,
        bgColor: bgColor
    }); 
    
    //makes the socket react to 'led' packets by calling this function
    socket.on('led', function (data) { 
        //updates brightness from the data object
        brightness = data.value;

        //sends the updated brightness to all connected clients
        io.sockets.emit('led', {
        	value: brightness
        }); 
    });

    // changes clients' backgrounds to new color submit
    socket.on('color', function (data) {
        bgColor = data.color;

        // updates arduino light
        // updateArduino(bgColor);

        // send new color to all clients
        io.sockets.emit('colorSet', {
            color: data.color
        });
    });
});