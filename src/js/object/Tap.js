var Tap = {};

(function() {
  var GROW_RATE = 0.1;
  var FADE_RATE = 0.002;
  var MAX_RADIUS;

  Tap.generate = function(x, y) {
    if (!MAX_RADIUS) {
      MAX_RADIUS = floorsix.getCanvasSize().width * 0.08;
    }
    return {
      x: x,
      y: y,
      radius: 0,
      opacity: 0.8,
      alive: true
    }
  }

  Tap.animate = function(tap, elapsedMs) {
    if (!tap.alive) {
      return;
    }

    tap.radius += GROW_RATE * elapsedMs;

    tap.opacity -= FADE_RATE * elapsedMs;
    if (tap.opacity <= 0) {
      tap.opacity = 0;
      tap.alive = false;
    }
  }

  Tap.render = function(tap, canvas) {
    if (!tap.alive) {
      return;
    }
    var ctx = canvas.context;
    ctx.fillStyle = "rgba(255, 255, 255, " + tap.opacity + ")";
    ctx.beginPath();
    ctx.arc(tap.x, tap.y, tap.radius, 0, Math.PI * 2);
    ctx.fill();
  }
})();
