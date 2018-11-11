var Meteor = {};

(function() {

  Meteor.generate = function(x, y, radius, level) {
    return {}
  }

  Meteor.animate = function(meteor, elapsedMs) {
    var vx = Math.cos(meteor.trajectory) * meteor.velocity;
    var vy = Math.sin(meteor.trajectory) * meteor.velocity;

    meteor.x += vx * elapsedMs;
    meteor.y += vy * elapsedMs;
  }

  Meteor.render = function(meteor, canvas) {

  }

})();
