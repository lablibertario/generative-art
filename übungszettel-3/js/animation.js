function Animation(keyframes, isLooping, type) {
  this.keyframes = keyframes || [];
  this.keyframes = helpers.bubbleSort(this.keyframes, 'time');

  this.isLooping = isLooping || false;

  this.type = type || 'line'; // lines, points, stroked, filled
}

Animation.prototype.addKeyframe = function(keyframe) {
  this.keyframes.push(keyframe);

  this.keyframes = helpers.bubbleSort(this.keyframes, 'time');
};

Animation.prototype.getData = function(time, tweening) {
  var duration = this.keyframes[this.keyframes.length - 1].time;

  if (time > duration) {

    if (this.isLooping) {
      time = time - (Math.floor(time / duration) * duration);
    } else {
      time = duration;
    }
  }

  var startKeyframe = 0;

  for (var i = 1; i < this.keyframes.length; i++) {
    if (this.keyframes[i].time < time) {
      startKeyframe++;
    }
  }

  var endKeyframe = 0;

  if (startKeyframe + 1 < this.keyframes.length) {
    endKeyframe = startKeyframe + 1;
  }

  var data = [];
  var startData = helpers.addPadding(this.keyframes[startKeyframe].data, this.keyframes[endKeyframe].data);
  var endData = helpers.addPadding(this.keyframes[endKeyframe].data, this.keyframes[startKeyframe].data);

  for (var i = 0; i < startData.length; i++) {
    var startPoint = startData[i],
        endPoint = endData[i];

    var sectionTime = time - this.keyframes[startKeyframe].time,
        sectionDuration = this.keyframes[endKeyframe].time - this.keyframes[startKeyframe].time;

    data.push(new Point(
      Tweening[tweening](sectionTime, startPoint.x, endPoint.x, sectionDuration),
      Tweening[tweening](sectionTime, startPoint.y, endPoint.y, sectionDuration)
    ));
  }

  return data;
};
