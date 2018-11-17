var Stats = {};

(function() {

  Stats.generate = function() {
    return {
      score: 0,
      level: 1
    }
  }

  Stats.breakMeteor = function(stats, meteor, planet) {
    var MAX_ELAPSED = 500;
    var now = new Date().getTime();
    var elapsed = stats.lastMeteor ? now - stats.lastMeteor : MAX_ELAPSED;
    if (elapsed > MAX_ELAPSED) elapsed = MAX_ELAPSED;
    var speedMultiplier = Math.ceil(Math.sqrt(MAX_ELAPSED - elapsed)) + 1;

    var MAX_D = planet.radius / 3;
    var d = Math.sqrt((planet.center.y - planet.radius) - meteor.y);
    if (d > MAX_D) {
      d = MAX_D;
    }
    var dangerMultiplier = Math.round(MAX_D / d);

    stats.score += 10 * speedMultiplier * dangerMultiplier;
    stats.lastMeteor = now;
  }

  Stats.levelComplete = function(stats) {
    stats.score += Math.round(Math.sqrt(stats.level) * 5000);
    stats.level++;
  }

  Stats.loadHighScore = function() {
    var highScore = 0;
    try {
      highScore = Number(localStorage.getItem('highscore'));
    } catch(ex) {
      console.warn("Can't read from local storage", ex);
    }
    return highScore;
  }

  Stats.saveScore = function(stats) {
    var highScore = Stats.loadHighScore();
    if (stats.score > highScore) {
      try {
        localStorage.setItem('highscore', stats.score.toString());
      } catch(ex) {
        console.warn("Couldn't save high score", ex);
      }
    }
  }

})();
