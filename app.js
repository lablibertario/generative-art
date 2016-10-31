/* globals */
var globals = (function() {
  var canvas = document.querySelector('canvas');

  return {
    canvas: canvas,
    ctx: canvas.getContext('2d'),
    datGui: new dat.GUI(),
    t: 0
  };
})();

/* app */
var app = (function(canvas, ctx, datGui, t) {

  var speed = 1,
      transitionSpeed = 1;

  var lineWidth = 1;

  var width = 0,
      height = 0,
      resolutionX = 100,
      resolutionY = 100;

  var pattern = '';

  var patterns = [];

  var noise = new SimplexNoise();

  function init(config) {
    resizeCanvas();

    window.addEventListener('resize', function() {
      resizeCanvas();
    });

    if (config && config.patterns) {
      pattern = config.patterns[0].name;

      config.patterns.forEach(function(pattern) {
        patterns.push(pattern);
      });
    }

    run();
  }

  function resizeCanvas() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    height = canvas.height;
    width = canvas.width;
  }

  function run() {
    clear();
    update();

    t = t + speed;

    requestAnimationFrame(run);
  }

  function update() {

    // update patterns
    patterns.forEach(function(pattern) {
      pattern.pattern.update(t);
    });

    ctx.lineWidth = app.lineWidth;

    // draw patterns
    for(var i = 0; i < width; i += width / app.resolutionX) {

      for(var j = 0; j < height; j += height / app.resolutionY) {

        var currentPattern = Math.floor((noise.noise2D(i / 500 + t / 500 * app.transitionSpeed, j / 500 + t / 500 * app.transitionSpeed) + 1) / 2 * patterns.length);

        var brightness = (noise.noise2D(1000 + i / 500 + t / 500, 2000 + j / 500 + t / 500) + 1) / 2;

        ctx.fillStyle = ctx.strokeStyle = 'rgba(255, 255, 255, ' + brightness + ')';

        patterns[currentPattern].pattern.drawSingle(i, j);
      }
    }
  }

  function clear() {
    ctx.clearRect(0, 0, width, height);
  }

  function updateGui(config) {
    datGui.destroy();
    datGui = new dat.GUI();

    if (config) {
      config.forEach(function(variable) {
        datGui.add(variable[0], variable[1], variable[2], variable[3]);
      });
    }
  }

  return {
    pattern: pattern,
    lineWidth: lineWidth,
    width: width,
    height: height,
    resolutionX: resolutionX,
    resolutionY: resolutionY,
    speed: speed,
    transitionSpeed: transitionSpeed,
    init: init,
    updateGui: updateGui
  };

})(globals.canvas, globals.ctx, globals.datGui, globals.t);

/* patterns */
var Vectors = (function(canvas, ctx) {
  function Vectors() {
    this.noise = new SimplexNoise();
  }

  Vectors.prototype.update = function(t) {
    this.t = t;
  };

  Vectors.prototype.draw = function(width, height) {
    for(var i = 0; i < width; i += width / app.resolutionX) {
      for(var j = 0; j < height; j += height / app.resolutionY) {
        this.drawSingle(i, j);
      }
    }
  };

  Vectors.prototype.drawSingle = function(x, y) {
    var offsetX = this.noise.noise2D(x + this.t / 200 * app.speed, y),
        offsetY = this.noise.noise2D(x, y + this.t / 200 * app.speed);

    ctx.beginPath();
    ctx.moveTo(x + offsetY * 10, y + offsetX * 10);
    ctx.lineTo(x + offsetX * 20, y + offsetY * 20);
    ctx.stroke();
  };

  return Vectors;
})(globals.canvas, globals.ctx);

var Rectangles = (function(canvas, ctx) {
  function Rectangles() {
    this.noise = new SimplexNoise();
  }

  Rectangles.prototype.update = function(t) {
    this.t = t;
  }

  Rectangles.prototype.draw = function() {
    for(var i = 0; i < width; i += width / app.resolutionX) {
      for(var j = 0; j < height; j += height / app.resolutionY) {
        this.drawSingle(i, j);
      }
    }
  }

  Rectangles.prototype.drawSingle = function(x, y) {
    var width = this.noise.noise2D(x + this.t / 200 * app.speed, y);

    ctx.fillRect(x, y, 2 + width * 10, 2);
  }

  return Rectangles;
})(globals.canvas, globals.ctx);

var Circles = (function(canvas, ctx) {
  function Circles() {
    this.noise = new SimplexNoise();
  }

  Circles.prototype.update = function(t) {
    this.t = t;
  }

  Circles.prototype.draw = function() {
    for(var i = 0; i < width; i += width / app.resolutionX) {
      for(var j = 0; j < height; j += height / app.resolutionY) {
        this.drawSingle(i, j);
      }
    }
  }

  Circles.prototype.drawSingle = function(x, y) {
    var offsetY = this.noise.noise2D(x + this.t / 200 * app.speed, y + this.t / 200 * app.speed);
    var radius = Math.abs(this.noise.noise2D(x + this.t / 200 * app.speed, y + this.t / 200 * app.speed));

    ctx.beginPath();
    ctx.arc(x, y + offsetY * 50, radius * 10, 0, 2 * Math.PI);
    ctx.stroke();
  }

  return Circles;
})(globals.canvas, globals.ctx);

/* transitions */
var SimpleTransition = (function() {
  function SimpleTransition(startTime, duration) {
    this.startTime = startTime;
    this.duration = duration;
  }

  SimpleTransition.prototype.transition = function(pattern1, pattern2, x, y, t) {
    var width = app.width;

    var progress = (this.startTime - t) / this.duration; // between 0 and 1

    var relativeX = x / width;

    return relative < progress ? pattern1 : pattern2;
  }
});

/* kick off app */
app.updateGui([
  [app, 'speed', 0.1, 10],
  [app, 'transitionSpeed', 0.1, 10],
  [app, 'resolutionX', 10, 200],
  [app, 'resolutionY', 10, 200],
  [app, 'lineWidth', 1, 10]
]);

app.init({
  patterns: [
    { name: 'vectors', pattern: new Vectors() },
    { name: 'rectangles', pattern: new Rectangles() },
    { name: 'circles', pattern: new Circles() }
  ],
  transitions: [
    { name: 'simple', transition: SimpleTransition }
  ]
});
