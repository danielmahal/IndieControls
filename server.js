var express = require('express'),
    http = require('http'),
    socketio = require('socket.io'),
    SerialPort = require('serialport'),
    Parser = require('./serialparser');

var serial, socket;

var usbConnected = false;

var connectUsb = function() {
    console.log('Trying to open serial...');

    SerialPort.list(function (err, ports) {
        if(err) console.error(err);

        ports.forEach(function(port) {
            console.log(port.comName);
            if(/usb/.test(port.comName)) {
                usbConnected = true;
                openSerial(port.comName);
                clearInterval(usbInterval);

                if(socket)
                    socket.emit('usb_connect');
            }
        });
    });
}

var usbInterval = setInterval(connectUsb, 1000);
connectUsb();

function openSerial(comName) {
    serial = new SerialPort.SerialPort(comName, {
        baudrate: 9600
    }, false);

    serial.open(function () {
        var parser = new Parser(serial);

        serial.on('data', parser.parse.bind(parser));

        parser.on('connect', function(i, module) {
            console.log('Connected', i, module);
            if(socket)
                socket.emit('module_connect', i, module);
        });

        parser.on('disconnect', function(i, module) {
            console.log('Disconnected', i, module);
            if(socket)
                socket.emit('module_disconnect', i, module);
        });

        parser.on('value', function(i, module) {
            console.log('Value', i, module);
            if(socket)
                socket.emit('module_value', i, module);
        });

        parser.on('ping', function(i, module) {
            console.log('Ping', i, module);
        });

        console.log('Serial opened, streaming data...');
    });
}

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server, {
    log: false
});

server.listen(8000);

app.use('/vendor', express.static(__dirname + '/vendor'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/connect', function (req, res) {
    res.sendfile(__dirname + '/connect.html');
});

io.sockets.on('connection', function (s) {
    socket = s;
    if(usbConnected)
        socket.emit('usb_connect');
});
