function bubbleSort(array, value) {
  var clone = array.slice(0);

  var swapped;

  do {
    swapped = false;

    for (var i = 0; i < array.length-1; i++) {

      if (clone[i][value] > clone[i + 1][value]) {
        var temp = clone[i];
        clone[i] = clone[i+1];
        clone[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);

  return clone;
}
