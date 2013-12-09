var ThrustNoise = require('./audio/ThrustNoise');
    BackgroundSound = require('./audio/Background'),
    ChainSound = require('./audio/Chain'),
    Particle = require('./Particle'),
    DangerSound = require('./audio/Danger');

var audioContext = new webkitAudioContext();

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var socket = io.connect('http://localhost');

var thrustNoise = new ThrustNoise(audioContext, 0.1);
var backgroundSound = new BackgroundSound(audioContext, 'assets/sounds/bg_loop.wav', 1);
var chainSound = new ChainSound(audioContext, 0.3);

var players = [];
var targetAngle = -Math.PI / 2;

var thrustParticles = [];

socket.on('open', function(data) {
    // console.log('Socket open');
});

socket.on('module_connect', function(player, i, data) {});

socket.on('module_disconnect', function(player, i, data) {});

socket.on('module_value', function(player, i, data) {
    if(data.type == 'button') {
        players[player].buttonDown = data.value;

        // thrustNoise[buttonDown ? 'start' : 'stop']();
    }

    if(data.type == 'pot')
        targetAngle = ((data.value * 2) - Math.PI * 0.7);
});

Physics({
    timestep: 1000.0 / 160,
    maxIPF: 16,
    integrator: 'verlet'
}, function(world) {
    var renderer = Physics.renderer('canvas', {
        el: 'canvas',
        width: 500,
        height: 300,
        meta: false,
        styles: {
            'circle' : {
                strokeStyle: null,
                lineWidth: 0,
                fillStyle: 'white',
                angleIndicator: null
            },
            'convex-polygon' : {
                strokeStyle: 'transparent',
                lineWidth: 0,
                fillStyle: 'aquamarine',
                angleIndicator: '#333'
            }
        }
    });

    world.add(renderer);
    world.add(Physics.behavior('body-collision-detection'));
    world.add(Physics.behavior('body-impulse-response'));
    world.add(Physics.behavior('sweep-prune'));
    world.add(Physics.behavior('constant-acceleration'), {
        acc: { x : 0, y: 0.004 }
    });

    var rigidConstraints = Physics.behavior('rigid-constraint-manager', {
        targetLength: 100
    });

    world.add(rigidConstraints);

    socket.on('usb_connect', function(i) {
        var player = Physics.body('convex-polygon', {
            x: window.innerWidth * Math.random(),
            y: window.innerHeight - 10,
            restitution: 0.5,
            angle: targetAngle,
            mass: 10,
            cof: 0.1,
            vertices: [
                { x: 0, y: 0 },
                { x: 0, y: 20 },
                { x: 20, y: 20 },
                { x: 20, y: 0 }
            ]
        });

        player.index = i;
        player.name = 'player';
        player.thrustParticles = [];
        player.buttonDown = false;

        world.add(player);
        players.push(player);
    });

    for(var i = 0; i < 5; i++) {
        var ball = Physics.body('circle', {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            mass: 0.2,
            cof: 0.8,
            radius: Math.random() * 10 + 8,
            fixed: true,
            restitution: 0.5
        });

        ball.name = 'ball';

        world.add(ball);
    }

    var bounds = Physics.aabb(0, 0, canvas.width, canvas.height);
    var edge = Physics.behavior('edge-collision-detection', {
      aabb: bounds,
      restitution: 0.99,
      cof: 0.99
    });

    world.add(edge);

    world.subscribe('step', function() {
        players.forEach(function(player, i) {
            player.state.angular.vel *= 0.85;
            player.state.angular.vel += (targetAngle - player.state.angular.pos) * 0.01;

            if(player.buttonDown) {
                var x = player.state.pos.get(0);
                var y = player.state.pos.get(1);
                var angle = player.state.angular.pos;
                player.accelerate(Physics.vector(Math.cos(angle) * 0.004, Math.sin(angle) * 0.003));
                player.thrustParticles.push(new Particle(x, y, angle + Math.PI));
            }

            player.thrustParticles.forEach(function(particle, i) {
                particle.life -= Math.random() * 0.05 + 0.05;

                if(particle.life <= 0)
                    delete player.thrustParticles[i];

                if(particle) {
                    particle.size = Math.sin(particle.life * Math.PI) * 5;
                    particle.x += Math.cos(particle.angle);
                    particle.y += Math.sin(particle.angle);
                }
            });
        });

        world.render();
    });

    world.subscribe('beforeRender', function() {
        players.forEach(function(player, i) {
            player.thrustParticles.forEach(function(particle, i) {
                if(particle) {
                    context.fillStyle = 'salmon';
                    context.beginPath();
                    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    context.closePath();
                    context.fill();
                }
            });
        });
    });

    world.subscribe('collisions:detected', function( data ){
        var c;
        for (var i = 0, l = data.collisions.length; i < l; i++){
            c = data.collisions[ i ];

            // var isPlayer = c.bodyA === player || c.bodyB === player;
            // var isBall = c.bodyA.name === 'ball' && c.bodyB.name === 'ball';
            // var isChain = c.bodyA.name === 'chain' && c.bodyB.name === 'chain';

            // if(isPlayer && !isBall && !isChain && Math.abs(c.mtv.x + c.mtv.y) > 5)
            //     rigidConstraints.drop();

            world.publish({
                topic: 'collision-pair',
                bodyA: c.bodyA,
                bodyB: c.bodyB
            });
        }
    });

    world.subscribe('collision-pair', function( data ){
        if(data.bodyA.name !== 'player' && data.bodyB.name !== 'player') return;

        var other = data.bodyA.name == 'player' ? data.bodyB : data.bodyA;
        var player = data.bodyA === other ? data.bodyB : data.bodyA;

        if(other.name != 'ball' || other.fixed === false) return;

        var x = player.state.pos.get(0);
        var y = player.state.pos.get(1);
        var angle = player.state.angular.pos + Math.PI;
        var distance;

        var chain = [];
        for(var i = 0; i < Math.round(Math.random() * 10 + 4); i++) {
            distance = i === 0 ? 20 : 5;

            x += Math.cos(angle) * distance;
            y += Math.sin(angle) * distance;

            var joint = new Physics.body('circle', {
                x: x,
                y: y,
                radius: 1,
                restitution: 0,
                cof: 0,
                mass: 0.01
            });

            chain.push(joint);

            joint.name = 'chain';

            rigidConstraints.constrain(chain[i - 1] || player, chain[i], distance);
        }

        distance = 20;

        x += Math.cos(angle) * distance;
        y += Math.sin(angle) * distance;

        world.add(chain);

        rigidConstraints.constrain(chain[chain.length - 1], other, distance);
        other.fixed = false;

        if(!player.attached) {
            player.attached = [];
            player.chains = [];
        }

        player.attached.push(ball);
        player.chains.push(chain);

        chainSound.attach();
    });

    socket.on('module_disconnect', function(i, data) {
        rigidConstraints.drop();
    });

    Physics.util.ticker.subscribe(function(time, dt){
        world.step(time);
    });

    Physics.util.ticker.start();

    var resize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        edge.setAABB(Physics.aabb(0, 0, canvas.width, canvas.height));
    };

    window.addEventListener('resize', resize);
    resize();
});
