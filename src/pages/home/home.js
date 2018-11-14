floorsix.controller("/", function() {
  var BACKGROUND_COLOR = "#1D2F37";
  var level = 1;
  var meteors = [];
  var planet;
  var stats;

  var time = 0;

  function initGame() {
    var canvasSize = floorsix.getCanvasSize();
    planet = Planet.generate(canvasSize);
    stats = Stats.generate();
  }
  initGame();

  function initLevel() {
    var canvasSize = floorsix.getCanvasSize();
    var totalMeteors = Math.floor(Math.sqrt(Math.sqrt(level)) * 10);
    meteors = new Array(totalMeteors);
    var meteorSize = (canvasSize.width * 0.04) / Math.floor(Math.sqrt(Math.sqrt(level)));
    var avgSpawnInterval = 1000 / Math.sqrt(Math.sqrt(level));
    var spawnAt = 100;
    for (var i=0; i < meteors.length; i++) {
      var target = {
        x: Math.random() * canvasSize.width,
        y: canvasSize.height
      }
      meteors[i] = Meteor.generate(Math.random() * canvasSize.width, 0, meteorSize, level, spawnAt, target.x, target.y);
      spawnAt += Math.random() * 100 - 50 + avgSpawnInterval;
    }
    console.log('meteors', meteors);
  }
  initLevel();

  function animate(elapsedMs) {
    time += elapsedMs;

    meteors.forEach(function(meteor) {
      if (time >= meteor.spawnAt && !meteor.spawned) {
        Meteor.spawn(meteor);
      }

      if (meteor.alive) {
        Meteor.animate(meteor, elapsedMs);
      }

      var result = Planet.hitTest(planet, meteor);
      if (result.hit && result.building) {
        meteor.alive = false;
        result.building.alive = false;
      }
      else if (result.hit) {
        meteor.alive = false;
      }
    });
  }

  function render(canvas) {
    var ctx = canvas.context;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Planet.render(planet, canvas);

    meteors.forEach(function(meteor) {
      if (meteor.alive) {
        Meteor.render(meteor, canvas);
      }
    });

    var fs = 14;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = fs + "px Avenir-Heavy";
    ctx.textAlign = "right";
    ctx.fillText(stats.score, canvas.width - 2, fs + 2);
  }

  function handleClick(x, y) {
    for (var m = 0; m < meteors.length; m++) {
      var meteor = meteors[m];
      if (meteor.alive && Meteor.hitTest(meteor, x, y)) {
        meteor.alive = false;
        Stats.breakMeteor(stats);
        break;
      }
    }
  }

  return {
    'animate': animate,
    'render': render,
    'click': handleClick
  }
});
