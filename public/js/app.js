var socket = io();

socket.on('connect', function () {
	socket.on('led', function (data) {
			document.getElementById("inputSlider").value = data.value;
			document.getElementById("outputText").innerHTML = data.value;
		});
});

function showValue(newValue) {
	newValue = $("#outputText").html();
	socket.emit('led', { value: newValue });
}