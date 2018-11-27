floorsix.controller("/play", function() {
  var GET_READY = 0;
  var NEXT_LEVEL = 10;
  var PLAYING = 20;
  var GAME_OVER = 30;

  var NEXT_LEVEL_TIMEOUT = 2500;
  var METEORS_PER_LEVEL = 20;

  var level = 0;
  var meteors = [];
  var planet;
  var stats;

  var phase = GET_READY;

  var time = 0;
  var flashOpacity = 0;

  var taps = [];

  var FLASH_FADE_RATE = 0.002;

  function initGame() {
    var canvasSize = floorsix.getCanvasSize();
    planet = Planet.generate(canvasSize);
    stats = Stats.generate();
    floorsix.setBackgroundAudio('www/audio/score2.mp3');
  }
  initGame();

  function initLevel() {
    time = 0;
    var canvasSize = floorsix.getCanvasSize();
    var totalMeteors = Math.floor(Math.sqrt(Math.sqrt(level)) * METEORS_PER_LEVEL);
    meteors = new Array(totalMeteors);
    var avgSpawnInterval = 2000 / Math.sqrt(Math.sqrt(level));
    var spawnAt = 300;
    for (var i=0; i < meteors.length; i++) {
      var target = Planet.getRandomBuildingCoordinates(planet);
      meteors[i] = Meteor.generate(canvasSize, level, spawnAt, target.x, target.y);
      spawnAt += Math.random() * 100 - 50 + avgSpawnInterval;
    }
  }

  function allBuildingsAreGone() {
    if (planet.buildings.find(function(b) { return b.alive; })) {
      return false;
    }
    return true;
  }

  function allMeteorsAreGone() {
    if (meteors.find(function(m) { return m.alive || !m.spawned; })) {
      return false;
    }
    return true;
  }

  function nextLevel() {
    if (level) {
      Stats.levelComplete(stats);
    }
    level++;
    time = 0;
    phase = NEXT_LEVEL;
  }

  function startFlash() {
    flashOpacity = 1;
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(200);
    }
  }

  function animate(elapsedMs) {
    // draw spots on the screen where the user has tapped
    taps.forEach(function(tap) {
      Tap.animate(tap, elapsedMs);
      if (!tap.alive) {
        taps.splice(taps.indexOf(tap), 1);
      }
    });

    // animate the bright flash (if necessary) that occurs after a collision
    if (flashOpacity) {
      flashOpacity -= FLASH_FADE_RATE * elapsedMs;
      if (flashOpacity < 0) {
        flashOpacity = 0;
      }
    }

    if (phase == GET_READY) {
      return;
    }
    else if (phase == NEXT_LEVEL) {
      time += elapsedMs;
      if (time >= NEXT_LEVEL_TIMEOUT) {
        initLevel();
        phase = PLAYING;
      }
      return;
    }

    time += elapsedMs;

    // render the meteors on screen
    meteors.forEach(function(meteor) {
      if (time >= meteor.spawnAt && !meteor.spawned && phase == PLAYING) {
        Meteor.spawn(meteor);
      }

      if (meteor.alive) {
        Meteor.animate(meteor, elapsedMs);

        var result = Planet.hitTest(planet, meteor);
        if (result.hit && result.building) {
          Meteor.crash(meteor);
          result.building.alive = false;
          startFlash();
          if (allBuildingsAreGone()) {
            phase = GAME_OVER;
            Stats.saveScore(stats);
          }
          else if (allMeteorsAreGone()) {
            nextLevel();
          }
        }
        else if (result.hit) {
          Meteor.break(meteor);
        }
      }
    });

  }

  function render(canvas) {
    var ctx = canvas.context;

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

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "35px Avenir-Heavy";
    ctx.textAlign = "center";

    if (phase == GET_READY) {
      ctx.fillText('READY?', canvas.width / 2, canvas.height / 3);
      ctx.font = "16px Avenir-Heavy";
      ctx.fillText('Tap to play', canvas.width / 2, canvas.height / 3 + 20);
    }
    else if (phase == GAME_OVER) {
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 3);
    }
    else if (phase == NEXT_LEVEL) {
      ctx.fillText('WAVE ' + level, canvas.width / 2, canvas.height / 3);
    }

    taps.forEach(function(tap) {
      Tap.render(tap, canvas);
    });

    // render the bright flash (if necessary) that occurs after a collision
    if (flashOpacity) {
      ctx.fillStyle = "rgba(157, 181, 191, " + flashOpacity + ")";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function handleClick(x, y) {
    if (phase == GET_READY) {
      nextLevel();
    }
    else if (phase == GAME_OVER) {
      floorsix.navigate('/');
    }
  }

  function handleTouchStart(pts) {
    pts.forEach(function(pt) {
      handleTouch(pt.x, pt.y);
    });
  }

  function handleTouch(x, y) {
    if (phase == PLAYING) {
      taps.push(Tap.generate(x, y));
      for (var m = 0; m < meteors.length; m++) {
        var meteor = meteors[m];
        if (meteor.alive && Meteor.hitTest(meteor, x, y)) {
          Meteor.break(meteor);
          Stats.breakMeteor(stats, meteor, planet);
          if (allMeteorsAreGone()) {
            nextLevel();
          }
          break;
        }
      }
    }
  }

  return {
    'animate': animate,
    'render': render,
    'click': handleClick,
    'touchstart': handleTouchStart,
  }
});
