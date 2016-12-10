function tweenLinear(currentTime, startValue, endValue, duration) {

  if (startValue === endValue || duration === 0) {
    return startValue;
  }

  var changeValue = endValue - startValue;

  return changeValue * currentTime / duration + startValue;
}

function tweenEased(currentTime, startValue, endValue, duration) {

  if (startValue === endValue || duration === 0) {
    return startValue;
  }

	var changeValue = endValue - startValue;

    currentTime /= duration / 2;

	if (currentTime < 1) {
      return changeValue / 2 * currentTime * currentTime + startValue;
    }

	currentTime--;

  var value = -changeValue / 2 * (currentTime * (currentTime - 2) - 1) + startValue;

	return value;
}
