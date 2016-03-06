var PORT = process.env.PORT || 3000;
var express = require('express');  //web server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);	//web socket server
var moment = require('moment');
var Forecast = require('forecast');
var hex2rgb = require('hex2rgb');
var Python = require('python-runner');

// instantiate file write variables (for use in updateUnicorn())
var fs = require('fs');
// var fsPath = __dirname + "/solid.py";
var fsPath;
var fsData;

function updateUnicorn (hex) {
  // convert hex to rgb
  rgbColor = hex2rgb(hex).rgb;

  // write new solid.py file with updated rgb values
  // fsPath = __dirname + '/solid.py';
  // fsData = "import unicornhat\nimport time\nunicornhat.brightness(0.2)\nr=" 
  //   + rgbColor[0] + "\ng=" 
  //   + rgbColor[1] + "\nb=" 
  //   + rgbColor[2] + "\nfor x in range (0,8):\n\tfor y in range (0,8):\n\t\tunicornhat.set_pixel(x,y,r,g,b)\nunicornhat.show()\ntime.sleep(5)\n";

  // write new stripes.py with updated rgb values
  // fsPath = __dirname + '/stripes.py';
  // fsData = "import unicornhat as UH\nimport time\nfor y in range(8):\n\tfor x in range(8):\n\t\tUH.set_pixel(x,y," + rgbColor[0] + "," + rgbColor[1] + "," + rgbColor[2] + ")\n\t\tUH.show()\n\t\ttime.sleep(0.05)\ntime.sleep(2)\n";

  // write new worm.py file with updated rgb values
  fsPath = __dirname + '/worm.py';
  fsData ="import unicornhat as UH\nimport time\nr=" 
      + rgbColor[0] + "\ng=" 
      + rgbColor[1] + "\nb=" 
      + rgbColor[2] + "\nsleepspeed=0.05\nfor y in range(8):\n\tif (y % 2) == 0:\n\t\tfor x in range(8):\n\t\t\tUH.set_pixel(x,y,r,g,b)\n\t\t\tUH.show()\n\t\t\ttime.sleep(sleepspeed)\n\telse:\n\t\tfor x in reversed(list(enumerate(8))):\n\t\t\tUH.set_pixel(x,y,r,g,b)\n\t\t\tUH.show()\n\t\t\ttime.sleep(sleepspeed)\ntime.sleep(2)\n";

  fs.writeFile(fsPath, fsData, function(error) {
       if (error) {
         console.error("write error:  " + error.message);
       } else {
         console.log("Successful Write to " + fsPath);
       }
  });

  Python.execScript(fsPath, {
                  // bin: "python3",
                  args: [ "argument" ]
  }).then(function(data){
          console.log(data);
  });
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