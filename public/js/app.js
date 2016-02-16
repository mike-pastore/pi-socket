// var socket = io();

// socket.on('connect', function () {
// 	socket.on('led', function (data) {
// 			document.getElementById("inputSlider").value = data.value;
// 			document.getElementById("outputText").innerHTML = data.value;
// 		});
// });

// function showValue(newValue) {
// 	newValue = $("#outputText").html();
// 	socket.emit('led', { value: newValue });
// }

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
		// swatches: ['#DB5461', '#686963', '#8AA29E', '#3D5467', '#F1EDEE']
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

// listen for slider changes
socket.on('led', function (data) {
	// set slider
	$('#inputSlider').val(data.value);
	$('#outputText').html(data.value);

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
});

// listen for bgcolor changes
socket.on('colorSet', function (data) {
	$('body').css('background', data.color);
});

function showValue(newValue) {
	$('#outputText').html(newValue);
	socket.emit('led', {
		value: newValue
	});
}