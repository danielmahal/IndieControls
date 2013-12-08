var ThrustNoise = require('./audio/ThrustNoise');
    BackgroundSound = require('./audio/Background'),
    Particle = require('./Particle');

var audioContext = new webkitAudioContext();

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var socket = io.connect('http://localhost');

var thrustNoise = new ThrustNoise(audioContext, 0.3);
var backgroundSound = new BackgroundSound(audioContext, 'assets/sounds/bg_loop.wav', 1);

var player;
var buttonDown = false;
var targetAngle = 0;

var particles = [];

socket.on('open', function(data) {
    // console.log('Socket open');
});

socket.on('module_connect', function(i, data) {});

socket.on('module_disconnect', function(i, data) {});

socket.on('module_value', function(i, data) {
    if(data.type == 'button') {
        buttonDown = data.value;
        thrustNoise[buttonDown ? 'start' : 'stop']();
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
            'convex-polygon' : {
                strokeStyle: null,
                lineWidth: 0,
                fillStyle: 'white',
                angleIndicator: '#333'
            }
        }
    });

    world.add(rigidConstraints);
    world.add(renderer);
    world.add(Physics.behavior('body-collision-detection'));
    world.add(Physics.behavior('body-impulse-response'));
    world.add(Physics.behavior('sweep-prune'));
    world.add(Physics.behavior('constant-acceleration'), {
        acc: { x : 0, y: 0.005 }
    });

    player = Physics.body('convex-polygon', {
        x: 0,
        y: 0,
        restitution: 0.5,
        mass: 5,
        cof: 0.1,
        vertices: [
            { x: 0, y: 0 },
            { x: 0, y: 20 },
            { x: 20, y: 20 },
            { x: 20, y: 0 }
        ]
    });

    world.add(player);

    var rigidConstraints = Physics.behavior('rigid-constraint-manager', {
        targetLength: 100
    });

    for(var i = 0; i < 5; i++) {
        var ball = Physics.body('circle', {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            mass: 0.5,
            cof: 0.8,
            radius: 10,
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
        player.state.angular.vel *= 0.85;
        player.state.angular.vel += (targetAngle - player.state.angular.pos) * 0.01;

        if(buttonDown) {
            var angle = player.state.angular.pos;
            player.accelerate(Physics.vector(Math.cos(angle) * 0.004, Math.sin(angle) * 0.002));
            particles.push(new Particle(player.state.pos.get(0), player.state.pos.get(1), player.state.angular.pos + Math.PI));
        }

        for(var i in particles) {
            particles[i].life -= Math.random() * 0.05 + 0.05;
            if(particles[i].life <= 0)
                delete particles[i];

            if(particles[i]) {
                particles[i].size = Math.sin(particles[i].life * Math.PI) * 5;
                particles[i].x += Math.cos(particles[i].angle);
                particles[i].y += Math.sin(particles[i].angle);
            }
        }

        world.render();
    });

    world.subscribe('render', function() {
        for(var i in particles) {
            if(particles[i]) {
                context.fillStyle = 'white';
                context.beginPath();
                context.arc(particles[i].x, particles[i].y, particles[i].size, 0, Math.PI * 2);
                context.closePath();
                context.fill();
            }
        }
    });

    world.subscribe('collisions:detected', function( data ){
        var c;
        for (var i = 0, l = data.collisions.length; i < l; i++){
            c = data.collisions[ i ];
            world.publish({
                topic: 'collision-pair',
                bodyA: c.bodyA,
                bodyB: c.bodyB
            });
        }
    });

    world.subscribe('collision-pair', function( data ){
        if(data.bodyA != player && data.bodyB != player) return;
        var other = data.bodyA == player ? data.bodyB : data.bodyA;

        if(other.name != 'ball') return;

        other.fixed = false;
        rigidConstraints.constrain(player, other);
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
