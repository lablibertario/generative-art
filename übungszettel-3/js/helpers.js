var helpers = {

  distance: function(x1, y1, x2, y2) {
    var a = x1 - x2
    var b = y1 - y2

    var c = Math.sqrt(a * a + b * b);

    return c;
  },

  scalePoints: function(points, scale, center) {

    if (!center) {
      center = new Point(0, 0);
    }

    var scaledPoints = [];

    for (var i = 0; i < points.length; i++) {
      var vector = new Vector2D(points[i].x, points[i].y);

      vector
        .sub(new Vector2D(center.x, center.y))
        .scale(scale)
        .add(new Vector2D(center.x, center.y));

      scaledPoints.push(new Point(vector.x, vector.y));
    }

    return scaledPoints;
  },

  addPadding: function(array, other) {

    if (array.length == other.length) {
      return array;
    }

    var clone = [];

    if (array.length < other.length) {
      clone = array.slice(0);

      for (var i = 0; i < (other.length - array.length); i++) {
        clone.push(clone[clone.length - 1]);
      }

      return clone;
    }

    return array;
  },

  bubbleSort: function(array, value) {
    var clone = array.slice(0);

    var swapped;

    do {
      swapped = false;

      for (var i = 0; i < array.length-1; i++) {

        if (clone[i][value] > clone[i+1][value]) {
          var temp = clone[i];
          clone[i] = clone[i+1];
          clone[i+1] = temp;
          swapped = true;
        }
      }
    } while (swapped);

    return clone;
  }

}
