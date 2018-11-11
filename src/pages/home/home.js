floorsix.controller("/", function() {
  var BACKGROUND_COLOR = "#323232";

  function animate(elapsedMs) {
    
  }

  function render(canvas) {
    var ctx = canvas.context;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function handleClick(x, y) {

  }

  return {
    'animate': animate,
    'render': render,
    'click': handleClick
  }
});
