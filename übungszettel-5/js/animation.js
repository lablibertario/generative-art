function Animation(keyFrames, isLooping) {
  this.keyFrames = keyFrames || [];
  this.keyFrames = bubbleSort(this.keyFrames, 'time');

  this.isLooping = isLooping || false;
}

Animation.prototype.addKeyFrame = function(keyFrame) {
  this.keyFrames.push(keyFrame);

  this.keyFrames = bubbleSort(this.keyFrames, 'time');
};

Animation.prototype.setIsLooping = function(isLooping) {
  this.isLooping = isLooping;
};

Animation.prototype.getData = function(time, tweening) {
  var duration = this.keyFrames[this.keyFrames.length - 1].time;

  if (time > duration) {

    if (this.isLooping) {
      time = time - (Math.floor(time / duration) * duration);
    } else {
      time = duration;
    }
  }

  var startKeyframe = 0;

  for (var i = 1; i < this.keyFrames.length; i++) {
    if (this.keyFrames[i].time < time) {
      startKeyframe++;
    }
  }

  var endKeyframe = 0;

  if (startKeyframe + 1 < this.keyFrames.length) {
    endKeyframe = startKeyframe + 1;
  }

  var keyFrameData = [];

  for (var i = 0; i < this.keyFrames[startKeyframe].data.length; i++) {
    var startData = this.keyFrames[startKeyframe].data[i],
        endData = this.keyFrames[endKeyframe].data[i];

    var sectionTime = time - this.keyFrames[startKeyframe].time,
        sectionDuration = this.keyFrames[endKeyframe].time - this.keyFrames[startKeyframe].time;

    var data = undefined;

    switch (startData.type) {
      case 'number':
        keyFrameData.push(tweening(sectionTime, startData.data, endData.data, sectionDuration));
        break;
      case 'vector':
        keyFrameData.push(new THREE.Vector3(
          tweening(sectionTime, startData.data.x, endData.data.x, sectionDuration),
          tweening(sectionTime, startData.data.y, endData.data.y, sectionDuration),
          tweening(sectionTime, startData.data.z, endData.data.z, sectionDuration)
        ));
        break;
    }
  }

  return keyFrameData;
};
