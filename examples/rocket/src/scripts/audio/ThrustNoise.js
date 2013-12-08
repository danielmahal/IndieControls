var ThrustNoise = function(context, gainValue) {
    this.gainValue = gainValue;
    this.context = context;
    this.interval;
    this.timer = 0;

    this.filter = context.createBiquadFilter();
    this.filter.type = 0;
    this.filter.frequency.value = 440;

    this.gain = context.createGain();
    this.gain.gain.value = gainValue;
    this.gain.connect(this.filter);

    var bufferSize = 2 * context.sampleRate;
    var noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    var lastOut = 0.0;

    for (var i = 0; i < bufferSize; i++) {
        var white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    this.noise = context.createBufferSource();
    this.noise.buffer = noiseBuffer;
    this.noise.loop = true;
    this.noise.start(0);
    this.noise.connect(this.gain);
}

ThrustNoise.prototype.start = function() {
    this.filter.connect(this.context.destination);

    this.interval = setInterval(function() {
        this.timer++;

        this.filter.frequency.value = Math.random() * 900 + 800;
        this.gain.gain.value = (Math.random() * 0.3 + 0.2) * this.gainValue;
    }.bind(this), 30);
}

ThrustNoise.prototype.stop = function() {
    this.filter.disconnect(this.context.destination);
    clearInterval(this.interval);
}

module.exports = ThrustNoise;
