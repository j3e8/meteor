var Planet = {};

(function() {

  Planet.render = function(canvas) {
    var ctx = canvas.context;

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height * 2.02, canvas.height * 1.1, 0, Math.PI*2);
    ctx.fill();
  }

})();
