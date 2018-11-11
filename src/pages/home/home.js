floorsix.controller("/", function() {
  var BACKGROUND_COLOR = "#1D2F37";
  var level = 1;
  var meteors = [];

  function init() {
    var canvasSize = floorsix.getCanvasSize();
    var totalMeteors = Math.floor(Math.sqrt(Math.sqrt(level)) * 10);
    meteors = new Array(totalMeteors);
    var meteorSize = (canvasSize.width * 0.04) / Math.floor(Math.sqrt(Math.sqrt(level)));
    var avgSpawnInterval = 100 / Math.sqrt(Math.sqrt(level));
    var spawnAt = 100;
    for (var i=0; i < meteors.length; i++) {
      meteors[i] = Meteor.generate(Math.random() * canvasSize.width, 0, meteorSize, level, spawnAt);
      spawnAt += Math.random() * 100 - 50 + avgSpawnInterval;
    }
    console.log('meteors', meteors);
  }
  init();

  function animate(elapsedMs) {
    meteors.forEach(function(meteor) {
      Meteor.animate(meteor, elapsedMs);
    });
  }

  function render(canvas) {
    var ctx = canvas.context;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    meteors.forEach(function(meteor) {
      Meteor.render(meteor, canvas);
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
