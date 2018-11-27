var Meteor = {};

(function() {
  var MIN_ROTATION_VELOCITY = 0.001;
  var MAX_ROTATION_VELOCITY = 0.0045;

  var AUDIO_METEOR_ENTRY = "www/audio/meteor-entry.mp3";
  var AUDIO_METEOR_BREAK = "www/audio/meteor-break.mp3";
  var AUDIO_METEOR_CRASH = "www/audio/meteor-crash.mp3";

  Meteor.generate = function(canvasSize, level, spawnAt, targetX, targetY) {
    var minVelocity = Math.sqrt(Math.sqrt(level)) * 0.08;
    var maxVelocity = Math.sqrt(Math.sqrt(level + 1)) * 0.08;

    // calculate meteor radius based on level and canvasSize
    var baseSize = canvasSize.width * 0.08;
    var levelMultipler = 1 / Math.sqrt(Math.sqrt(level));
    var randomMultiplier = Math.random() * 0.4 + 0.8; // between 0.8 and 1.2
    var radius = baseSize * levelMultipler * randomMultiplier;

    // generate vertices
    var vertices = [];
    var num = 9;
    var degrees = 0;
    while (num > 0) {
      var avg = (360 - degrees) / num;
      var min = 0.6 * avg;
      var max = 1.66667 * avg;

      var angle = Math.random() * (max - min) + min;

      var minRadius = 0.8;
      var maxRadius = 1.2;
      var r = Math.random() * (maxRadius - minRadius) + minRadius;

      degrees += angle;
      vertices.push({
        theta: (degrees / 180)  * Math.PI,
        radius: radius * r
      });

      num--;
    }

    // generate spots
    var spots = [];
    var spotColors = [ '#A0B1B0', '#BCC6C5', '#B2BCBB' ];
    for (var i=0; i < vertices.length; i+=2) {
      var spot = {
        theta: vertices[i].theta,
        radius: vertices[i].radius * (Math.random() * 0.25 + 0.4),
        radiusX: Math.random() * radius * 0.1 + radius * 0.10,
        radiusY: Math.random() * radius * 0.1 + radius * 0.18,
        rotation: vertices[i].theta,
        fill: spotColors[Math.floor(Math.random() * spotColors.length)]
      }
      spots.push(spot);
    }

    var x = Math.random() * canvasSize.width;
    var y = -radius;

    var rotationVelocity = Math.random() * (MAX_ROTATION_VELOCITY - MIN_ROTATION_VELOCITY) + MIN_ROTATION_VELOCITY;
    if (Math.random() < 0.5) {
      rotationVelocity *= -1;
    }

    var audio = new Audio();
    audio.src = AUDIO_METEOR_ENTRY;

    // return meteor object
    return {
      alive: false,
      x: x,
      y: y,
      radius: radius,
      rotation: 0,
      rotationVelocity: rotationVelocity,
      velocity: Math.random() * (maxVelocity - minVelocity) + minVelocity,
      spots: spots,
      vertices: vertices,
      trajectory: floorsix.math.atan(targetY - y, targetX - x),
      spawnAt: spawnAt,
      spawned: false,
      audio: audio
    }
  }

  Meteor.hitTest = function(meteor, x, y) {
    var sqd = (meteor.x - x) * (meteor.x - x) + (meteor.y - y) * (meteor.y - y);
    if (sqd <= meteor.radius * meteor.radius) {
      return true;
    }
    return false;
  }

  Meteor.animate = function(meteor, elapsedMs) {
    if (!meteor.alive) {
      return;
    }
    var vx = Math.cos(meteor.trajectory) * meteor.velocity;
    var vy = Math.sin(meteor.trajectory) * meteor.velocity;

    meteor.x += vx * elapsedMs;
    meteor.y += vy * elapsedMs;

    meteor.rotation += meteor.rotationVelocity * elapsedMs;
    while (meteor.rotation >= Math.PI * 2) {
      meteor.rotation -= Math.PI * 2;
    }
    while (meteor.rotation < 0) {
      meteor.rotation += Math.PI * 2;
    }
  }

  Meteor.render = function(meteor, canvas) {
    if (!meteor.alive) {
      return;
    }
    var ctx = canvas.context;

    // render the tail
    ctx.save();
    ctx.translate(meteor.x, meteor.y);

    ctx.fillStyle = "rgba(153, 219, 247, 0.05)";
    ctx.beginPath();
    ctx.arc(0, 0, meteor.radius * 1.4, meteor.trajectory - Math.PI / 1.75, meteor.trajectory + Math.PI / 1.75);
    ctx.lineTo(Math.cos(meteor.trajectory) * -meteor.radius * 6.6, Math.sin(meteor.trajectory) * -meteor.radius * 6.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(153, 219, 247, 0.1)";
    ctx.beginPath();
    ctx.arc(0, 0, meteor.radius * 1.25, meteor.trajectory - Math.PI / 1.75, meteor.trajectory + Math.PI / 1.75);
    ctx.lineTo(Math.cos(meteor.trajectory) * -meteor.radius * 6, Math.sin(meteor.trajectory) * -meteor.radius * 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(153, 219, 247, 0.2)";
    ctx.beginPath();
    ctx.arc(0, 0, meteor.radius * 1.1, meteor.trajectory - Math.PI / 1.75, meteor.trajectory + Math.PI / 1.75);
    ctx.lineTo(Math.cos(meteor.trajectory) * -meteor.radius * 5.4, Math.sin(meteor.trajectory) * -meteor.radius * 5.4);
    ctx.closePath();
    ctx.fill();

    // render the meteor rock
    ctx.rotate(meteor.rotation);
    ctx.fillStyle = "#C5D1D1";
    ctx.beginPath();
    for (var i=0; i < meteor.vertices.length; i++) {
      var vertex = meteor.vertices[i];
      var x = Math.cos(vertex.theta) * vertex.radius;
      var y = Math.sin(vertex.theta) * vertex.radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      }
      else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    for (var i=0; i < meteor.spots.length; i++) {
      var spot = meteor.spots[i];
      var x = Math.cos(spot.theta) * spot.radius;
      var y = Math.sin(spot.theta) * spot.radius;
      ctx.fillStyle = spot.fill;
      ctx.beginPath();
      ctx.ellipse(x, y, spot.radiusX, spot.radiusY, spot.rotation, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  Meteor.break = function(meteor) {
    meteor.alive = false;
    meteor.audio.src = AUDIO_METEOR_BREAK;
    meteor.audio.volume = 0.3;
    meteor.audio.play();
  }

  Meteor.crash = function(meteor) {
    meteor.alive = false;
    meteor.audio.src = AUDIO_METEOR_CRASH;
    meteor.audio.volume = 0.6;
    meteor.audio.play();
  }

  Meteor.spawn = function(meteor) {
    meteor.alive = true;
    meteor.spawned = true;
    meteor.audio.src = AUDIO_METEOR_ENTRY;
    meteor.audio.volume = 0.2;
    meteor.audio.play();
  }

})();
