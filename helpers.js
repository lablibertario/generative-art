function lerp(a, b, t) {
  return a * (1 - t) + b * t;
}

function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  else if (value > max) {
    return max;
  }

  return value;
}
