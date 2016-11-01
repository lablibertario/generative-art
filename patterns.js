'use strict';

function Vectors(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.noise = new SimplexNoise();
  this.time = 0;
  this.tempo = 1;
}

Vectors.prototype.update = function(time, tempo) {
  this.time = time;
  this.tempo = tempo;
};

Vectors.prototype.draw = function(width, height, resolutionWidth, resolutionHeight) {
  for(var i = 0; i < width; i += width / resolutionWidth) {
    for(var j = 0; j < height; j += height / resolutionHeight) {
      this.drawSingle(i, j);
    }
  }
};

Vectors.prototype.drawSingle = function(x, y) {
  var offsetX = this.noise.noise2D(x + this.time / 200 * this.tempo, y),
      offsetY = this.noise.noise2D(x, y + this.time / 200 * this.tempo);

  this.context.beginPath();
  this.context.moveTo(x + offsetY * 10, y + offsetX * 10);
  this.context.lineTo(x + offsetX * 20, y + offsetY * 20);
  this.context.stroke();
};

function Rectangles(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.noise = new SimplexNoise();
  this.time = 0;
  this.tempo = 1;
}

Rectangles.prototype.update = function(time, tempo) {
  this.time = time;
  this.tempo = tempo;
};

Rectangles.prototype.draw = function(width, height, resolutionWidth, resolutionHeight) {
  for(var i = 0; i < width; i += width / resolutionWidth) {
    for(var j = 0; j < height; j += height / resolutionHeight) {
      this.drawSingle(i, j);
    }
  }
};

Rectangles.prototype.drawSingle = function(x, y) {
  var width = this.noise.noise2D(x + this.time / 200 * this.tempo, y);

  this.context.fillRect(x, y, 2 + width * 10, 2);
};

function Circles(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.noise = new SimplexNoise();
  this.time = 0;
  this.tempo = 1;
}

Circles.prototype.update = function(time, tempo) {
  this.time = time;
  this.tempo = tempo;
};

Circles.prototype.draw = function(width, height, resolutionWidth, resolutionHeight) {
  for(var i = 0; i < width; i += width / resolutionWidth) {
    for(var j = 0; j < height; j += height / resolutionHeight) {
      this.drawSingle(i, j);
    }
  }
};

Circles.prototype.drawSingle = function(x, y) {
  var offsetY = this.noise.noise2D(x + this.time / 200 * this.tempo, y + this.time / 200 * this.tempo);
  var radius = Math.abs(this.noise.noise2D(x + this.time / 200 * this.tempo, y + this.time / 200 * this.tempo));

  this.context.beginPath();
  this.context.arc(x, y + offsetY * 50, radius * 10, 0, 2 * Math.PI);
  this.context.stroke();
};
