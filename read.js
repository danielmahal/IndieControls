var express = require('express'),
    http = require('http'),
    socketio = require('socket.io'),
    SerialPort = require('serialport');

console.log('Trying to open serial...');

var serial, socket;

SerialPort.list(function (err, ports) {
    if(err) console.error(err);

    ports.forEach(function(port) {
        console.log(port.comName);
        if(/usb/.test(port.comName))
            openSerial(port.comName);
    });
});

function openSerial(comName) {
    serial = new SerialPort.SerialPort(comName, {
        baudrate: 9600,
        parser: SerialPort.parsers.readline("\n")
    }, false);

    serial.open(function () {
        console.log('Serial opened, streaming data...');
        serial.on('data', function(data) {
            console.log(data);
            if(socket) {
                var split = data.replace(/\s/g, '').split(':');
                socket.emit('update', {
                    id: parseInt(split[0], 10),
                    value: parseInt(split[1], 10)
                });
            }
        });
    });
}

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server, {
    log: false
});

server.listen(8000);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (s) {
    socket = s;
});
