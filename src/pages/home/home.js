floorsix.controller("/", function() {
  var highScore = Stats.loadHighScore();

  var NUM_STARS = 75;
  floorsix.setBackgroundAudio('www/audio/score2.mp3');

  var canvasSize = floorsix.getCanvasSize();
  var stars = new Array(NUM_STARS);
  for (var i=0; i < stars.length; i++) {
    stars[i] = {
      x: Math.random() * canvasSize.width,
      y: Math.random() * canvasSize.height,
      brightness: Math.random() * 0.5 + 0.3,
      size: Math.random() * 2.0
    }
  }

  function animate(elapsedMs) {

  }

  function render(canvas) {
    var ctx = canvas.context;

    // render stars in the background
    stars.forEach(function(star) {
      renderStar(star, canvas);
    })

    // render the game title
    var fs = Math.round(canvas.width * 0.2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = fs + "px Avenir-Heavy";
    ctx.textAlign = "center";

    ctx.fillText('METEOR', canvas.width / 2, canvas.height / 3);

    if (highScore) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "14px Avenir-Heavy";
      ctx.textAlign = "center";
      ctx.fillText('High score: ' + highScore, canvas.width / 2, canvas.height / 3 + 40);
    }

    ctx.font = "16px Avenir-Heavy";
    ctx.fillText('Tap to play', canvas.width / 2, canvas.height / 1.5);
  }

  function renderStar(star, canvas) {
    var ctx = canvas.context;
    var hex = Math.round(star.brightness * 255).toString(16);
    ctx.fillStyle = '#' + hex + hex + hex;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
    ctx.fill();
  }

  function handleClick(x, y) {
    floorsix.navigate('/play');
  }

  return {
    'animate': animate,
    'render': render,
    'click': handleClick
  }
});
