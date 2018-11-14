var Planet = {};

(function() {

  Planet.generate = function(canvasSize) {
    var NUM_BUILDINGS = 11;

    var MIN_ANGLE = Math.PI * 1.43;
    var MAX_ANGLE = Math.PI * 1.57;
    var degreesPerBuilding = (MAX_ANGLE - MIN_ANGLE) / NUM_BUILDINGS;

    var MIN_HEIGHT = 0.05 * canvasSize.height;
    var MAX_HEIGHT = 0.15 * canvasSize.height;

    var buildings = new Array(NUM_BUILDINGS);
    for (var i=0; i < buildings.length; i++) {
      buildings[i] = generateBuilding(MIN_ANGLE + degreesPerBuilding * i, MIN_ANGLE + degreesPerBuilding * (i+1), Math.random() * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT);
    }

    return {
      buildings: buildings,
      color: createPastel(),
      center: {
        x: canvasSize.width / 2,
        y: canvasSize.height * 2.02
      },
      radius: canvasSize.height * 1.1
    }
  }

  Planet.hitTest = function(planet, meteor) {
    let result = {
      hit: false
    }
    let dx = planet.center.x - meteor.x;
    let dy = planet.center.y - meteor.y;
    let sqd = (dx * dx) + (dy * dy);
    let sqMinRadiusToCollide = (planet.radius - meteor.radius) * (planet.radius - meteor.radius);
    let sqMaxRadiusToCollide = (planet.radius + meteor.radius) * (planet.radius + meteor.radius);
    if (sqd >= sqMinRadiusToCollide && sqd <= sqMaxRadiusToCollide) {
      result.hit = true;

      // the meteor has hit the surface. now let's figure out which building (if any)
      let angleOfIncidence = floorsix.math.atan(dy, dx);
      let inverseAngleOfIncidence = angleOfIncidence + Math.PI;
      while (inverseAngleOfIncidence >= Math.PI * 2) inverseAngleOfIncidence -= Math.PI * 2;
      for (let b = 0; b < planet.buildings.length; b++) {
        let building = planet.buildings[b];
        if (building.start <= inverseAngleOfIncidence && inverseAngleOfIncidence <= building.end) {
          result.building = building;
          break;
        }
      }
      return result;
    }
    return result;
  }

  Planet.render = function(planet, canvas) {
    var ctx = canvas.context;

    // render buildings
    planet.buildings.forEach(function(building) {
      renderBuilding(building, planet, canvas);
    });

    // render planet curve
    ctx.fillStyle = planet.color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(planet.center.x, planet.center.y, planet.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
  }

  function generateBuilding(start, end, height) {
    return {
      alive: true,
      color: createPastel(),
      start: start,
      end: end,
      height: height
    }
  }

  function renderBuilding(building, planet, canvas) {
    if (!building.alive) {
      return;
    }
    var WINDOW_PADDING_TOP = 0.01 * canvas.height;
    var WINDOW_HEIGHT = 0.015 * canvas.height;
    var NUM_WINDOW_COLUMNS = 2;
    var WINDOW_PADDING_SIDE = 0.005;

    var ctx = canvas.context;
    ctx.save();
    ctx.translate(planet.center.x, planet.center.y);
    ctx.fillStyle = building.color;
    ctx.strokeStyle = building.color;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(Math.cos(building.start) * planet.radius, Math.sin(building.start) * planet.radius);
    ctx.lineTo(Math.cos(building.start) * (planet.radius + building.height), Math.sin(building.start) * (planet.radius + building.height));
    ctx.lineTo(Math.cos(building.end) * (planet.radius + building.height), Math.sin(building.end) * (planet.radius + building.height));
    ctx.lineTo(Math.cos(building.end) * planet.radius, Math.sin(building.end) * planet.radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // render windows
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";

    var windowWidthAngle = ((building.end - building.start) - 3 * WINDOW_PADDING_SIDE) / NUM_WINDOW_COLUMNS;
    for (var rad = building.height - WINDOW_PADDING_TOP; rad >= WINDOW_HEIGHT + WINDOW_PADDING_TOP; rad -= WINDOW_HEIGHT + WINDOW_PADDING_TOP) {
      for (var theta = building.start + WINDOW_PADDING_SIDE; theta < building.end - WINDOW_PADDING_SIDE; theta += windowWidthAngle + WINDOW_PADDING_SIDE) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(Math.cos(theta) * (planet.radius + rad), Math.sin(theta) * (planet.radius + rad));
        ctx.lineTo(Math.cos(theta + windowWidthAngle) * (planet.radius + rad), Math.sin(theta + windowWidthAngle) * (planet.radius + rad));
        ctx.lineTo(Math.cos(theta + windowWidthAngle) * (planet.radius + rad - WINDOW_HEIGHT), Math.sin(theta + windowWidthAngle) * (planet.radius + rad - WINDOW_HEIGHT));
        ctx.lineTo(Math.cos(theta) * (planet.radius + rad - WINDOW_HEIGHT), Math.sin(theta) * (planet.radius + rad - WINDOW_HEIGHT));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function createPastel() {
    var r = Math.floor(Math.random() * 35) + 215;
    var g = Math.floor(Math.random() * 35) + 215;
    var b = Math.floor(Math.random() * 35) + 215;
    return '#' + r.toString(16) + g.toString(16) + b.toString(16);
  }

})();
