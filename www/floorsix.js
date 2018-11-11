(function() {

  if (!window.floorsix) {
    window.floorsix = {};
  }

  var lastFrame;
  var controllers = {};
  var animator, renderer, click, mousedown, mousemove, mouseup, touchstart, touchmove, touchend;
  var canvas;
  var currentRoute;
  var config = {
    aspect: 0.8,
    backgroundColor: '#000000'
  };
  var NAV_IDLE = 0;
  var NAV_FADE_IN = 1;
  var NAV_FADE_OUT = 2;
  var NAV_FADE_RATE = 0.0015;
  var navigator = {
    shadowOpacity: 0,
    phase: NAV_IDLE,
    route: ''
  }

  var _isInitialized = false;
  var ratio = 1;
  var output = document.createElement("div");

  floorsix.app = function(cfg) {
    _isInitialized = true;
    config = Object.assign({}, config, cfg);
  }

  floorsix.clone = function(item) {
    if (item && Object.prototype.toString.call(item) == '[object Array]') {
      var result = item.slice(0);
      result.forEach(function(child, i) {
        result[i] = floorsix.clone(child);
      });
      return result;
    }
    else if (item && typeof(item) == 'object') {
      var result = {};
      for (var prop in item) {
        result[prop] = floorsix.clone(item[prop]);
      }
      return result;
    }
    return item;
  }

  floorsix.controller = function(route, fn) {
    controllers[route] = fn;
  }

  floorsix.geometry = {};
  floorsix.geometry.subtractPoints = function(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y
    }
  }

  floorsix.getCanvasSize = function() {
    return canvas ? {
      width: canvas.width / ratio,
      height: canvas.height / ratio
    } : null;
  }

  floorsix.log = function(str) {
    var line = document.createElement('div');
    line.textContent = str;
    output.appendChild(line);
  }

  floorsix.math = {};
  floorsix.math.atan = function(rise, run) {
    if (run == 0 && rise > 0) {
      return Math.PI * 0.5;
    }
    else if (run == 0 && rise <= 0) {
      return Math.PI * 1.5;
    }
    var angle = Math.atan(rise / run);
    if (run < 0) {
      angle += Math.PI;
    }
    return angle;
  }

  floorsix.math.polarToCartesian = function(polar) {
    var c = {
      x: Math.cos(polar.t) * polar.r,
      y: Math.sin(polar.t) * polar.r
    }
    return c;
  }

  floorsix.navigate = function(route) {
    navigator.phase = NAV_FADE_OUT;
    navigator.shadowOpacity = 0;
    navigator.route = route;
  }

  floorsix.physics = {};
  floorsix.physics.gravity = 0.001;

  floorsix.search = function() {
    var search = {};
    if (window.location.hash.indexOf('?') == -1) {
      return search;
    }
    var qs = window.location.hash.substring(window.location.hash.indexOf('?') + 1);
    var pairs = qs.split('&');
    pairs.forEach(function(pair) {
      var parts = pair.split('=');
      var key = decodeURIComponent(parts[0]);
      if (key) {
        var value = decodeURIComponent(parts[1]);
        if (value == '') {
          value = true;
        }
        if (key.indexOf('[]') != -1) {
          key = key.substring(0, key.indexOf('[]'));
          if (!search[key]) {
            search[key] = [];
          }
          search[key].push(value);
        }
        else if (key.indexOf('[') != -1) {
          var tmp = key;
          key = tmp.substring(0, tmp.indexOf('['));
          var childKey = tmp.substring(tmp.indexOf('[') + 1, tmp.indexOf(']', tmp.indexOf('[')));
          if (!search[key]) {
            search[key] = {};
          }
          search[key][childKey] = value;
        }
        else {
          search[key] = value;
        }
      }
    });
    return search;
  }

  window.addEventListener("load", function() {
    document.body.style.padding = "0";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = config.backgroundColor;
    document.body.height = "100%";
    document.body.innerHTML = '';

    canvas = document.createElement("canvas");
    canvas.style.position = "relative";
    document.body.appendChild(canvas);
    fillParent();

    initClickEvents();

    var _resizeTimer;
    window.addEventListener("resize", function() {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(fillParent, 50);
    });

    setInterval(checkForRouteChange, 100);

    if (floorsix.search().debug) {
      output.style.position = "fixed";
      output.style.zIndex = "100";
      output.style.left = "0";
      output.style.right = "0";
      output.style.top = "0";
      output.style.height = "15%";
      output.style.overflowY = "scroll";
      output.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      output.style.color = "#ffffff";
      document.body.appendChild(output);
    }

    _requestAnimationFrame(animate);
  });

  function checkForRouteChange() {
    if (!_isInitialized) {
      return;
    }
    var newRoute = getCurrentRoute();
    if (newRoute != currentRoute) {
      currentRoute = newRoute;
      changeRoute();
    }
  }

  function getCurrentRoute() {
    if (!window.location.hash) {
      return '/';
    }
    var indexOfHash = window.location.hash.indexOf('#');
    var hash = window.location.hash.substring(indexOfHash + 1);
    if (hash.indexOf('?') != -1) {
      hash = hash.substring(0, hash.indexOf('?'));
    }
    if (!hash) {
      return '/';
    }
    return hash;
  }

  function changeRoute() {
    if (controllers[currentRoute]) {
      var result = controllers[currentRoute]();
      animator = result.animate;
      renderer = result.render;
      click = result.click;
      mousedown = result.mousedown;
      mousemove = result.mousemove;
      mouseup = result.mouseup;
      touchstart = result.touchstart;
      touchmove = result.touchmove;
      touchend = result.touchend;
      render();
    }
    else {
      console.error("Controller not found for route", currentRoute);
    }
  }

  function fillParent() {
    var ctx = canvas.getContext('2d');
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                              ctx.mozBackingStorePixelRatio ||
                              ctx.msBackingStorePixelRatio ||
                              ctx.oBackingStorePixelRatio ||
                              ctx.backingStorePixelRatio || 1;
    ratio = devicePixelRatio / backingStoreRatio;

    var windowAspect = document.body.offsetWidth / document.body.offsetHeight;
    var w, h;
    if (windowAspect >= config.aspect) {
      h = document.body.offsetHeight;
      w = h * config.aspect;
      var extra = document.body.offsetWidth - w;
      canvas.style.marginLeft = (extra / 2) + "px";
      canvas.style.marginTop = "0";
    }
    else {
      w = document.body.offsetWidth;
      h = w / config.aspect;
      var extra = document.body.offsetHeight - h;
      canvas.style.marginTop = (extra / 2) + "px";
      canvas.style.marginLeft = "0";
    }

    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = Math.round(w) + 'px';
    canvas.style.height = Math.round(h) + 'px';
  }

  function initClickEvents() {
    canvas.addEventListener("click", function(e) {
      var pt = getCoordsRelativeToCanvas(e.clientX, e.clientY, canvas);
      if (click) {
        click(pt.x, pt.y);
      }
    });
    canvas.addEventListener("mousedown", function(e) {
      var pt = getCoordsRelativeToCanvas(e.clientX, e.clientY, canvas);
      if (mousedown) {
        mousedown(pt.x, pt.y);
      }
    });
    canvas.addEventListener("mousemove", function(e) {
      var pt = getCoordsRelativeToCanvas(e.clientX, e.clientY, canvas);
      if (mousemove) {
        mousemove(pt.x, pt.y);
      }
    });
    canvas.addEventListener("mouseup", function(e) {
      var pt = getCoordsRelativeToCanvas(e.clientX, e.clientY, canvas);
      if (mouseup) {
        mouseup(pt.x, pt.y);
      }
    });
    canvas.addEventListener("touchstart", function(e) {
      var pts = e.touches.map(function(t) {
        return getCoordsRelativeToCanvas(t.clientX, t.clientY, canvas);
      });
      if (touchstart) {
        touchstart(pts);
      }
    });
    canvas.addEventListener("touchmove", function(e) {
      var pts = e.touches.map(function(t) {
        return getCoordsRelativeToCanvas(t.clientX, t.clientY, canvas);
      });
      if (touchmove) {
        touchmove(pts);
      }
    });
    canvas.addEventListener("touchend", function(e) {
      var pts = e.touches.map(function(t) {
        return getCoordsRelativeToCanvas(t.clientX, t.clientY, canvas);
      });
      if (touchend) {
        touchend(pts);
      }
    });
  }

  function getCoordsRelativeToCanvas(x, y, canvas) {
    var bounds = canvas.getBoundingClientRect();
    x = x - bounds.left;
    y = y - bounds.top;
    return { x: x, y: y };
  }

  function _requestAnimationFrame(animate) {
    if (window.requestAnimationFrame) window.requestAnimationFrame(animate);
    else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(animate);
    else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(animate);
    else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame(animate);
    else { console.error("Can't request animation frame"); }
  }

  function animate() {
    if (!_isInitialized) {
      return;
    }
    var thisFrame = new Date().getTime();
    if (!lastFrame) lastFrame = thisFrame;
    var elapsedMs = thisFrame - lastFrame;
    if (navigator.phase == NAV_FADE_IN) {
      navigator.shadowOpacity -= NAV_FADE_RATE * elapsedMs;
      if (navigator.shadowOpacity <= 0) {
        navigator.shadowOpacity = 0;
        navigator.phase = NAV_IDLE;
      }
    }
    else if (navigator.phase == NAV_FADE_OUT) {
      navigator.shadowOpacity += NAV_FADE_RATE * elapsedMs;
      if (navigator.shadowOpacity >= 1) {
        navigator.shadowOpacity = 1;
        navigator.phase = NAV_FADE_IN;
        window.location.hash = "#" + navigator.route;
      }
    }
    if (elapsedMs && animator) {
      var shouldRender = animator(elapsedMs);
      if (shouldRender !== false) {
        render();
      }
    }
    lastFrame = thisFrame;
    _requestAnimationFrame(animate);
  }

  function render() {
    var ctx = canvas.getContext("2d");
    var canvasSize = floorsix.getCanvasSize();
    ctx.save();
    ctx.scale(ratio, ratio);

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    if (renderer) {
      renderer({
        width: canvasSize.width,
        height: canvasSize.height,
        context: canvas.getContext('2d'),
        ratio: ratio
      });
    }
    if (navigator.phase == NAV_FADE_IN || navigator.phase == NAV_FADE_OUT) {
      ctx.fillStyle = "#000000";
      ctx.globalAlpha = navigator.shadowOpacity;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

})();
