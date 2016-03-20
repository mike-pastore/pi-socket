var PORT = process.env.PORT || 3000;
var express = require('express'); //web server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server); //web socket server
var moment = require('moment');
var Forecast = require('forecast');
var hex2rgb = require('hex2rgb');
var Python = require('python-runner');

// instantiate file write variables (for use in updateUnicorn())
var fs = require('fs');

// // <----- START PYTHON SCRIPT, LISTEN TO SERIAL PORT ----->
var fsPath;
var fsData;



// Python.execScript(fsPath, {
//   bin: "python",
//   args: ["argument"]
// }).then(function (data) {
//   console.log(data);
// });
// <----- *** ----->

function updateUnicorn(hex) {
  // convert hex to rgb
  rgbColor = hex2rgb(hex).rgb;

  fsPath = __dirname + '/flora-neopixel.py';
  fsData = "import serial\nimport time\nser = serial.Serial('/dev/ttyACM1', 9600)\nser.write('" 
      + rgbColor[0] + "," 
      + rgbColor[1] + "," 
      + rgbColor[2] + "')\ntime.sleep(1000)";

  fs.writeFile(fsPath, fsData, function (error) {
    if (error) {
      console.error("write error:  " + error.message);
    } else {
      console.log("Successful Write to " + fsPath);
    }
  });

  Python.execScript(fsPath, {
    bin: "python",
    args: ["argument"]
  }).then(function (data) {
    console.log(data);
  });

  // Python.exec(
  //   "import serial\nser = serial.Serial('/dev/ttyACM1', 9600)\nr=" + rgbColor[0] + "\ng=" + rgbColor[1] + "\nb=" + rgbColor[2] + "\nser.write('r,g,b')"
  // )

  // Python.exec(
  //   [
  //     "import serial",
  //     "ser = serial.Serial('/dev/ttyACM1', 9600)",
  //     "ser.write('rVal,gVal,bVal')"
  //   ],
  //   {
  //     "rVal" : rgbColor[0],
  //     "gVal" : rgbColor[1],
  //     "bVal" : rgbColor[2]
  //   }
  // ).then(function(data){
  //   console.log(data);
  // });

}

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

// instantiate rgb version of bgColor for unicorn (rgb)
var rgbColor = [];

// id counter for requests
var requestCounter = 0;

// array to store requests
var requestArray = [];

//gets called whenever a client connects
io.sockets.on('connection', function (socket) {

  // log timestamp for server start
  var clientStartTime = moment();

  // log difference between Client and Server start times
  var diffTime = serverStartTime.fromNow();

  // pull current weather
  forecast.get([41.9290292, -87.7131625], function (err, weather) {
    if (err) return console.log(err);

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
    bgColor: bgColor,
    requestArray: requestArray
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

    // updates unicorn hat light
    updateUnicorn(bgColor);

    // REQUEST INFORMATION for queue
    // collects request entry
    requestCounter++;
    // request timestamp
    var requestTimestamp = moment().format('h:mm:ss a');

    // push to array for future new clients
    requestArray.push({
      color: data.color,
      counter: requestCounter,
      timestamp: requestTimestamp
    });

    // send new color to all clients
    io.sockets.emit('colorSet', {
      color: data.color,
      counter: requestCounter,
      timestamp: requestTimestamp
    });
  });
});