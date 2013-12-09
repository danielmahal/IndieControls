var express = require('express'),
    http = require('http'),
    socketio = require('socket.io'),
    SerialPort = require('serialport'),
    Parser = require('./serialparser');

var socket;

var comsConnected = [];
var serials = [];

var connectUsb = function() {
    console.log('Trying to open serial...');

    SerialPort.list(function (err, ports) {
        if(err) console.error(err);

        ports.forEach(function(port) {
            if(/usb/.test(port.comName) && comsConnected.indexOf(port.comName) === -1) {
                var index = comsConnected.length
                openSerial(port.comName, index);
                comsConnected.push(port.comName);

                // Stop retrying connecting if there are two connected
                if(comsConnected.length == 2) {
                    clearInterval(usbInterval);
                }

                if(socket) {
                    socket.emit('usb_connect', index);
                }
            }
        });
    });
}

var usbInterval = setInterval(connectUsb, 1000);
connectUsb();

function openSerial(comName, comIndex) {
    console.log('Found serial', comName, 'at index', comIndex);

    serials[comIndex] = new SerialPort.SerialPort(comName, {
        baudrate: 9600
    }, false);

    serials[comIndex].open(function () {
        var parser = new Parser(serials[comIndex]);

        serials[comIndex].on('data', parser.parse.bind(parser));

        parser.on('connect', function(i, module) {
            console.log('Connected', comIndex, i, module);
            if(socket)
                socket.emit('module_connect', comIndex, i, module);
        });

        parser.on('disconnect', function(i, module) {
            console.log('Disconnected', comIndex, i, module);
            if(socket)
                socket.emit('module_disconnect', comIndex, i, module);
        });

        parser.on('value', function(i, module) {
            console.log('Value', comIndex, i, module);
            if(socket)
                socket.emit('module_value', comIndex, i, module);
        });

        parser.on('ping', function(i, module) {
            console.log('Ping', comIndex, i, module);
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

io.sockets.on('connection', function (s) {
    socket = s;

    serials.forEach(function(serial, i) {
        socket.emit('usb_connect', i);
    });

});

app.use('/rocket', express.static(__dirname + '/examples/rocket'));
app.use('/connect', express.static(__dirname + '/examples/connect'));
app.use('/viewer', express.static(__dirname + '/examples/viewer'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/rocket', function (req, res) {
    res.sendfile(__dirname + '/examples/rocket/index.html');
});

app.get('/connect', function (req, res) {
    res.sendfile(__dirname + '/examples/connect/index.html');
});

app.get('/viewer', function (req, res) {
    res.sendfile(__dirname + '/examples/viewer/index.html');
});
