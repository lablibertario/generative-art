function Terrain(detail) {
  this.size = Math.pow(2, detail) + 1;
  this.max = this.size - 1;
  this.map = new Float32Array(this.size * this.size);
}

Terrain.prototype.setMap = function(map) {
  this.map = map;
};

Terrain.prototype.get = function(x, y) {
  if (x < 0 || x > this.max || y < 0 || y > this.max) {
    return -1;
  }

  return this.map[x + this.size * y];
};

Terrain.prototype.set = function(x, y, val) {
  this.map[x + this.size * y] = val;
};

Terrain.prototype.generate = function(roughness) {
  var that = this;

  this.set(0, 0, that.max);
  this.set(this.max, 0, that.max / 2);
  this.set(this.max, this.max, 0);
  this.set(0, this.max, that.max / 2);

  divide(this.max);

  function divide(size) {
    var x, y, half = size / 2;
    var scale = roughness * size;

    if (half < 1) { return; }

    for (y = half; y < that.max; y += size) {
      for (x = half; x < that.max; x += size) {
        square(x, y, half, Math.random() * scale * 2 - scale);
      }
    }

    for (y = 0; y <= that.max; y += half) {
      for (x = (y + half) % size; x <= that.max; x += size) {
        diamond(x, y, half, Math.random() * scale * 2 - scale);
      }
    }

    divide(size / 2);
  }

  function average(values) {
    var valid = values.filter(function(val) {
      return val !== -1;
    });

    var total = valid.reduce(function(sum, val) {
      return sum + val;
    }, 0);

    return total / valid.length;
  }

  function square(x, y, size, offset) {
    var ave = average([
      that.get(x - size, y - size),   // upper left
      that.get(x + size, y - size),   // upper right
      that.get(x + size, y + size),   // lower right
      that.get(x - size, y + size)    // lower left
    ]);

    that.set(x, y, ave + offset);
  }

  function diamond(x, y, size, offset) {
    var ave = average([
      that.get(x, y - size),      // top
      that.get(x + size, y),      // right
      that.get(x, y + size),      // bottom
      that.get(x - size, y)       // left
    ]);

    that.set(x, y, ave + offset);
  }
};

Terrain.prototype.getAverageHeight = function() {
  return this.map.reduce(function(a, b) {
    return a + b;
  }, 0) / this.map.length;
};

Terrain.prototype._toMesh = function(width, increments, wireframe) {
  var geometry = new THREE.PlaneGeometry(width, width, increments - 1, increments - 1);

  var increment = width / increments;

  var minHeight = Infinity;
  var maxHeight = -Infinity;

  for (var y = 0; y < increments; y++) {
    for (var x = 0; x < increments; x++) {

      var height = this.get(Math.floor(x * increment * this.size / width),
        Math.floor(y * increment * this.size / width));

      if (height < minHeight) { minHeight = height; }

      if (height > maxHeight) { maxHeight = height; }

      if (height < 0) { height = 0; }

      if (y === 0 || y === increments - 1 || x === 0 || x === increments - 1) {
        height = 0;
      }

      geometry.vertices[y * increments + x].z = height;
    }
  }

  var averageHeight = (maxHeight - minHeight) / 2;

  geometry.vertices.forEach(function(vertex) {
    vertex.z -= averageHeight;
  });

  // geometry.computeFaceNormals();
  // geometry.computeFlatVertexNormals()
  // geometry.computeVertexNormals();

  var material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: wireframe,
    shading: THREE.FlatShading,
    side: THREE.DoubleSide
  });

  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  return mesh;
};

Terrain.prototype.toShadedMesh = function (width, increments) {
  return this._toMesh(width, increments, false);
};

Terrain.prototype.toWireframeMesh = function (width, increments) {
  return this._toMesh(width, increments, true);
};

Terrain.prototype._toObjects = function(width, increments, fn) {
  var objects = [];

  var increment = width / increments;
  var offsetWidth = width / 2;
  var offsetHeight = this.getAverageHeight();

  for (var y = 0; y < width; y += increment) {
    for (var x = 0; x < width; x += increment) {

      var height = this.get(Math.floor(x * this.size / width), Math.floor(y * this.size / width));

      var pointX = x - offsetWidth,
          pointY = height - offsetHeight,
          pointZ = y - offsetWidth;

      objects.push(fn(new THREE.Vector3(pointX, pointY, pointZ)));
    }
  }

  return objects;
};

Terrain.prototype.toPoints = function(width, increments) {
  return this._toObjects(width, increments, createPoint);
};

Terrain.prototype.toSpheres = function(width, increments) {
  return this._toObjects(width, increments, createSphere);
};

Terrain.prototype.toCubes = function(width, increments) {
  return this._toObjects(width, increments, createCube);
};
