'use strict';

function SimpleTransition(startTime) {
  this.startTime = startTime;

  this.noise = new SimplexNoise();
}

SimpleTransition.prototype.transition = function(pattern1, pattern2, x, y, width, height, time, endTime) {
  var duration = endTime - this.startTime;

  var progress = (time - this.startTime) / duration; // between 0 and 1

  var offsetX = this.noise.noise2D(x, y + time / 500) * 100;

  return (x + offsetX) / width > progress ? pattern1 : pattern2;
};

SimpleTransition.prototype.isFinished = function(time, endTime) {
  var duration = endTime - this.startTime;

  return (time - this.startTime) / duration > 1;
};

function SimpleTransition(startTime) {
  this.startTime = startTime;

  this.noise = new SimplexNoise();
}

function NoiseTransition(startTime) {
  this.startTime = startTime;

  this.noise = new SimplexNoise();
}

NoiseTransition.prototype.transition = function(pattern1, pattern2, x, y, width, height, time, endTime) {
  var duration = endTime - this.startTime;

  var progress = (time - this.startTime) / duration; // between 0 and 1

  var value = (this.noise.noise2D(x + time / 500, y + time / 500) + 1) / 2;

  return value > progress ? pattern1 : pattern2;
};

NoiseTransition.prototype.isFinished = function(time, endTime) {
  var duration = endTime - this.startTime;

  return (time - this.startTime) / duration > 1;
};

function RadialTransition(startTime) {
  this.startTime = startTime;

  this.noise = new SimplexNoise();
}

RadialTransition.prototype.transition = function(pattern1, pattern2, x, y, width, height, time, endTime) {
  var duration = endTime - this.startTime;

  var progress = (time - this.startTime) / duration; // between 0 and 1

  var radius = width > height ? width / 2 : height / 2;

  var distance = helpers.distance(x, y, width / 2, height / 2); // distance from center

  var noiseValue = this.noise.noise2D(x, y) * 50;

  var value = (distance + noiseValue) / radius;

  return value > progress ? pattern1 : pattern2;
};

RadialTransition.prototype.isFinished = function(time, endTime) {
  var duration = endTime - this.startTime;

  return (time - this.startTime) / duration > 1;
};
