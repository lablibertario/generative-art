'use strict';

function App(config) {
  var that = this;

  if (!config) {
    throw new Error('no configuration found');
  }

  if (!config.canvas) {
    throw new Error('no canvas element found');
  }

  this.canvas = config.canvas;

  this.width = this.canvas.width;
  this.height = this.canvas.height;

  this.resizeCanvas();

  window.addEventListener('resize', function() {
    that.resizeCanvas();
  });

  this.time = 0;
  this.tempo = 1;
  this.isRunning = false;

  this.autoInvertColors = true;
  this.autoChangeAnimations = false;
  this.autoMoveCenter = true;
  this.depthEnabled = true;
  this.depthCount = 10;
  this.fillPolygons = false;
  this.zooming = true;
  this.clearOpacity = 0.9;
  this.invertColors = false;

  this.center = new Point(this.canvas.width / 2, this.canvas.height / 2);
  this.initialCenter = this.center;

  this.noise = new SimplexNoise();

  this.polygon = new Polygon([
    new Point(this.width / 2, 100),
    new Point(100, this.height - 100),
    new Point(this.width - 100, this.height - 100)
  ]);

  this.datGui = undefined;

  if (config.variables) {
    this.datGui = new dat.GUI();

    this.updateGui(config.variables);
  }

  window.addEventListener('keydown', function(e) {

    if (e.key === 'i') {
      that.invertColors = !that.invertColors;
    }

    if (e.key === 'a') {

      // change animation

    }
  });
}

App.prototype.updateGui = function(variables) {
  this.datGui.destroy();
  this.datGui = new dat.GUI();

  var that = this;

  if (variables) {
    variables.forEach(function(variable) {

      var controller;

      switch (variable.type) {
        case 'boolean':
          controller = that.datGui.add(that, variable.variable).listen();
          break;
        case 'number':
          controller = that.datGui.add(that, variable.variable, variable.min, variable.max).listen();
          break;
      }

      if (variable.name) {
        controller.name(variable.name);
      }
    });
  }
};

App.prototype.resizeCanvas = function() {
  this.canvas.width = document.documentElement.clientWidth;
  this.canvas.height = document.documentElement.clientHeight;

  this.height = this.canvas.height;
  this.width = this.canvas.width;
}

App.prototype.run = function() {
  var that = this;

  this.isRunning = true;

  if (this.datGui) {
    for (var i in this.datGui.__controllers) {
      this.datGui.__controllers[i].updateDisplay();
    }
  }

  function innerRun() {

    if (that.isRunning) {
      that.clear();
      that.update();

      that.time = that.time + that.tempo;
    }

    requestAnimationFrame(innerRun);
  }

  innerRun();
}

App.prototype.stop = function() {
  this.isRunning = false;
}

App.prototype.clear = function() {
  var context = this.canvas.getContext('2d');

  if (this.invertColors) {
    context.fillStyle = 'rgba(255, 255, 255, ' + this.clearOpacity + ')';
  } else {
    context.fillStyle = 'rgba(0, 0, 0, ' + this.clearOpacity + ')';
  }

  context.fillRect(0, 0, this.width, this.height);
}

App.prototype.update = function() {

  var that = this;

  var context = this.canvas.getContext('2d');

  if (Math.random() < 0.01 * this.tempo && this.autoInvertColors) {
    this.invertColors = !this.invertColors;
  }

  if (Math.random() < 0.01 * this.tempo) {
    this.fillPolygons = !this.fillPolygons;
  }

  if (this.autoMoveCenter) {
    var offsetX = this.noise.noise2D(this.time / 500, 0) * 250;
    var offsetY = this.noise.noise2D(1000 + this.time / 500, 0) * 250;

    this.center = new Point(this.initialCenter.x + offsetX, this.initialCenter.y + offsetY);
  }

  var offsetScale = this.noise.noise2D(1000 + this.time / 500, 0) + 1;

  if (this.depthEnabled) {

    for (var i = 1; i <= this.depthCount; i++) {

      var points = helpers.scalePoints(this.polygon.points, 1 / (i * offsetScale), this.center);

      var polygon = new Polygon(points);

      if (this.fillPolygons) {
        this.invertColors ? polygon.setColor('rgba(0, 0, 0, 0.1)')
          : polygon.setColor('rgba(255, 255, 255, 0.1)');

        polygon.drawFilled(context);
      } else {
        this.invertColors ? polygon.setColor('rgb(0, 0, 0)')
          : polygon.setColor('rgb(255, 255, 255)');

        polygon.drawStroked(context);
      }

    }

  } else {

    if (this.fillPolygons) {
      this.invertColors ? this.polygon.setColor('rgba(0, 0, 0, 0.1)')
        : this.polygon.setColor('rgba(255, 255, 255, 0.1)');

      this.polygon.drawFilled(context);
    } else {
      this.invertColors ? this.polygon.setColor('rgb(0, 0, 0)')
        : this.polygon.setColor('rgb(255, 255, 255)');

      this.polygon.drawStroked(context);
    }

  }
}
