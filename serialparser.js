var util = require('util'),
    EventEmitter = require('events').EventEmitter;

var serial,
    modules = [],
    currentIndex;

var typeMap = {
    0: 'pot',
    1: 'button'
};

var timeouts = [];

var Parser = function(s) {
    serial = s;
}

util.inherits(Parser, EventEmitter);

Parser.prototype.parse = function(raw) {
    var buffers = [];

    for(var i = 0; i < raw.length; i++) {
        buffers[i] = raw.slice(i, i + 1);
    }

    values = buffers.map(function(buffer) {
        return buffer.readUInt8(0);
    });

    values.forEach(function(data) {
        if(data < 40) {
            currentIndex = data;
        } else if(currentIndex) {
            var i = currentIndex;
            var newConnection = false;
            var module = modules[i];

            clearTimeout(timeouts[i]);
            timeouts[i] = setTimeout(function() {
                this.emit('disconnect', i, module);
                delete modules[i];
            }.bind(this), 1000);

            if(!module) {
                if(data < 50 && data >= 40) {
                    module = modules[i] = {};
                    newConnection = true;
                } else {
                    return;
                }
            }

            if(data < 50) {
                module.type = typeMap[data - 40];
                this.emit('ping', i, module);
            } else {
                var value = (data - 50) / 200;

                if(module.type == 'button')
                    value = Math.round(value) == 1 ? true : false;

                module.value = value;
                this.emit('value', i, module);
            }

            if(newConnection) {
                this.emit('connect', i, module);
            }
        }
    }.bind(this));
}

module.exports = Parser;
