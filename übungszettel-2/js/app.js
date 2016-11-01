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

  this.resolutionWidth = 50;
  this.resolutionHeight = 50;

  this.time = 0;
  this.tempo = 1;
  this.transitionTempo = 1;
  this.isRunning = false;

  this.clearOpacity = 0.9;
  this.lineWidth = 1;

  this.patterns = [];
  this.currentPattern = 0;

  if (!config.patterns) {
    throw new Error('no patterns found');
  }

  config.patterns.forEach(function(pattern) {

    // push instance
    that.patterns.push(new pattern(that.canvas));
  });

  this.transitions = [];
  this.currentTransition = undefined;

  if (!config.transitions && config.patterns.length > 1) {
    throw new Error('no transitions found');
  }

  config.transitions.forEach(function(transition) {

    // push contructor
    that.transitions.push(transition);
  });

  this.noise = new SimplexNoise();

  this.datGui = undefined;

  if (config.variables) {
    this.datGui = new dat.GUI();

    this.updateGui(config.variables);
  }
}

App.prototype.updateGui = function(variables) {
  this.datGui.destroy();
  this.datGui = new dat.GUI();

  var that = this;

  if (variables) {
    variables.forEach(function(variable) {
      that.datGui.add(that, variable[0], variable[1], variable[2]);
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

  context.fillStyle = 'rgba(0, 0, 0, ' + this.clearOpacity + ')';

  context.fillRect(0, 0, this.width, this.height);
}

App.prototype.update = function() {

  var that = this;

  var context = this.canvas.getContext('2d');

  context.lineWidth = this.lineWidth;

  // update patterns
  this.patterns.forEach(function(pattern) {
    pattern.update(that.time, that.tempo);
  });

  // draw patterns
  for(var i = 0; i < this.width; i += this.width / this.resolutionWidth) {

    for(var j = 0; j < this.height; j += this.height / this.resolutionHeight) {

      if (!this.currentTransition) {
        var index = Math.floor(Math.random() * this.transitions.length);

        this.currentTransition = new this.transitions[index](this.time);
      }

      var nextPattern = this.currentPattern + 1 === this.patterns.length ? 0 : this.currentPattern + 1;

      var endTime = this.currentTransition.startTime + 200 / this.transitionTempo;

      var pattern = this.currentTransition.transition(
        this.currentPattern,
        nextPattern,
        i,
        j,
        this.width,
        this.height,
        this.time,
        endTime
      );

      var isFinished = this.currentTransition.isFinished(this.time, endTime);

      if (isFinished) {
        this.currentTransition = undefined;

        this.currentPattern = nextPattern;
      }

      var brightness = (this.noise.noise2D(
        1000 + i / 500 + this.time / 500,
        2000 + j / 500 + this.time / 500
      ) + 1) / 2;

      context.fillStyle = context.strokeStyle = 'rgba(255, 255, 255, ' + brightness + ')';

      this.patterns[pattern].drawSingle(i, j);
    }
  }
}
