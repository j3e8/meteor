var Stats = {};

(function() {

  Stats.generate = function() {
    return {
      score: 0
    }
  }

  Stats.breakMeteor = function(stats) {
    var MAX_ELAPSED = 1000;
    var now = new Date().getTime();
    var elapsed = stats.lastMeteor ? now - stats.lastMeteor : MAX_ELAPSED;
    if (elapsed > MAX_ELAPSED) elapsed = MAX_ELAPSED;
    var multiplier = Math.ceil(Math.sqrt(MAX_ELAPSED - elapsed)) + 1;
    stats.score += 100 * multiplier;
    stats.lastMeteor = now;
  }

})();
