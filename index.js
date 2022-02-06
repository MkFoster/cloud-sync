var usbDetect = require('usb-detection');

usbDetect.startMonitoring();
usbDetect.on('add', function(device) {
	console.log(device);
});
