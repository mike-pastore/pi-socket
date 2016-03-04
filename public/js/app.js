var socket = io.connect();

// icons for weather
var skycons = new Skycons();

// instantiate color picker
$('#colorPickerInput').minicolors({
	animationSpeed: 50,
	animationEasing: 'swing',
	change: function(value, opacity) {
		$('#colorDiv').css('background-color', value);
	},
	changeDelay: 0,
	control: 'hue',
	dataUris: true,
	defaultValue: '#000000',
	format: 'hex',
	hide: null,
	hideSpeed: 100,
	inline: false,
	keywords: '',
	letterCase: 'lowercase',
	opacity: false,
	position: 'bottom right',
	show: null,
	showSpeed: 100,
	theme: 'default'
});

// change bg color on submit
$('#submitButton').click(function () {
	var hexInput = $('#colorPickerInput').val();

	$('body').css('background', hexInput);

	// emit new color to server (to change other clients' bg)
	socket.emit('color', {
		color: hexInput
	});
});

// listen for current server state
socket.on('led', function (data) {
	// set times
	$('#serverTime').html(data.serverStartTime);
	$('#clientTime').html(data.clientStartTime);
	$('#diffTime').html(data.diffTime);

	// set weather
	$('#weatherSummary').html(data.weatherSummary);
	$('#temperature').html(data.temperature);
	skycons.add('iconCanvas', data.weatherIcon);
	skycons.play();

	// change bg color
	$('body').css('background', data.bgColor);

	// build existing request array
	buildRequestArray(data.requestArray);
});

// listen for bgcolor changes
socket.on('colorSet', function (data) {
	$('body').css('background', data.color);

	// add request to queue
	$('#requestBody').append('<tr class="bold" style="background-color: rgba(' 
		+ hexToRgb(data.color).r + ','
		+ hexToRgb(data.color).g + ','
		+ hexToRgb(data.color).b + ',0.6)"><td>' 
		+ data.counter + '</td><td>' 
		+ data.timestamp + '</td><td>' + data.color + '</td></tr>');
});

// hexToRgb pulled from http://stackoverflow.com/a/5624139/4221054
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// build existing request array for new client
function buildRequestArray(reqArray) {
	for (i = 0; i < reqArray.length; i++) {
		var data = reqArray[i];

		$('#requestBody').append('<tr class="bold" style="background-color: rgba(' 
			+ hexToRgb(data.color).r + ','
			+ hexToRgb(data.color).g + ','
			+ hexToRgb(data.color).b + ',0.6)"><td>' 
			+ data.counter + '</td><td>' 
			+ data.timestamp + '</td><td>' + data.color + '</td></tr>');
	}
}