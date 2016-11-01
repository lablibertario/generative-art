'use strict';

function SimpleTransition(startTime) {
  this.startTime = startTime;
}

SimpleTransition.prototype.transition = function(pattern1, pattern2, x, y, t, endTime) {
  var duration = endTime - this.startTime;

  var progress = (t - this.startTime) / duration; // between 0 and 1

  return x / width > progress ? pattern1 : pattern2;
};

SimpleTransition.prototype.isFinished = function(time, endTime) {
  var duration = endTime - this.startTime;

  return (time - this.startTime) / duration > 0.9;
};
