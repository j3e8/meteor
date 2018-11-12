floorsix.controller("/", function() {
  var BACKGROUND_COLOR = "#1D2F37";
  var level = 1;
  var meteors = [];
  var planet;

  var time = 0;

  function initGame() {
    var canvasSize = floorsix.getCanvasSize();
    planet = Planet.generate(canvasSize);
    console.log('planet', planet);
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
      if (time >= meteor.spawnAt) {
        Meteor.spawn(meteor);
      }

      if (meteor.alive) {
        Meteor.animate(meteor, elapsedMs);
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
  }

  function handleClick(x, y) {

  }

  return {
    'animate': animate,
    'render': render,
    'click': handleClick
  }
});
