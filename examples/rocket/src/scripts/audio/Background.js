var Background = function(context, url, gainValue) {
    this.source;

    var loadSound = function(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                console.log('Sound loaded');
                playSound(buffer);
            }, function() {
                console.log('Error loading sound');
            });
        }

        request.send();
    }

    var playSound = function(buffer) {
        console.log('Playing sound');

        var source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.start(0);

        gain = context.createGain();
        gain.gain.value = gainValue;
        gain.connect(context.destination);

        source.connect(gain);

    }

    loadSound(url);
}


module.exports = Background;
