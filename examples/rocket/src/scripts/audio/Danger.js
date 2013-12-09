var Danger = function(context, gainValue) {
    this.gainValue = gainValue;

    this.gain = context.createGain();
    this.gain.gain.value = gainValue;
    this.gain.connect(context.destination);

    this.oscillator = context.createOscillator();
    this.oscillator.type = 0;
    this.oscillator.frequency.value = 70;
    this.oscillator.start(0);
    this.oscillator.connect(this.gain);

    var timer = 0;

    setInterval(function() {
        timer++;
        this.oscillator.frequency.value = Math.sin(timer / 1) * 20 + 60;
    }.bind(this), 20);
}

Danger.prototype.setDanger = function(level) {
    this.gain.gain.value = this.gainValue * level;
}

module.exports = Danger;
