var Chain = function(context, gainValue) {
    this.looping = false;
    this.gainValue = gainValue;
    this.context = context;
    this.attachBuffers = [];
    this.attachBuffer;
    this.loopSound;

    var loadSound = function(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            context.decodeAudioData(request.response, callback, function() {
                console.log('Error loading sound', url);
            });
        }.bind(this);

        request.send();
    }.bind(this);

    for(var i = 0; i < 5; i++) {
        loadSound('assets/sounds/chain-attach-' + i + '.wav', function(buffer) {
            this.attachBuffers.push(buffer);
            console.log('Sound loaded', buffer);
        }.bind(this));
    }

    loadSound('assets/sounds/chain-loop.wav', function(buffer) {
        var source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.gain.value = this.gainValue;
        this.loopSound = source;
    }.bind(this));

    loadSound('assets/sounds/chain-attach.wav', function(buffer) {
        this.attachBuffer = buffer;
    }.bind(this));
}

Chain.prototype.attach = function() {
    if(!this.looping) this.loop();
    this.looping = true;

    var source = this.context.createBufferSource();
    source.buffer = this.attachBuffer;
    source.connect(this.context.destination);
    source.gain.value = 1;
    source.start(0);

    var index = Math.ceil(Math.random() * this.attachBuffers.length - 1);
    source = this.context.createBufferSource();
    source.buffer = this.attachBuffers[index];
    source.connect(this.context.destination);
    source.gain.value = this.gainValue;

    setTimeout(function() {
        source.start(0);
    }, 100);
}

Chain.prototype.loop = function() {
    console.log('loop');
    this.loopSound.gain.value = 0.05;
    this.loopSound.start(0);
    this.loopSound.connect(this.context.destination);
}


module.exports = Chain;
