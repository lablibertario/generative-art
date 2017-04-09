'use strict';

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

Terrain.prototype.getMinHeight = function() {
  var minHeight = Infinity;

  this.map.forEach(function(height) {
    if (height < minHeight) {
      minHeight = height;
    }
  });

  return minHeight;
};

Terrain.prototype.getMaxHeight = function() {
  var maxHeight = -Infinity;

  this.map.forEach(function(height) {
    if (height > maxHeight) {
      maxHeight = height;
    }
  });

  return maxHeight;
};

Terrain.prototype._toMesh = function(width, increments, wireframe, color) {
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

  var texture = this.createTexture(width, increments);

  var material = new THREE.MeshPhongMaterial({
    // color: color || 0xEF2D5E,
    map: texture,
    wireframe: wireframe,
    shading: THREE.FlatShading,
    side: THREE.DoubleSide,
    shininess: 0
  });

  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;

  mesh.receiveShadow = true;
  mesh.castShadow = true;

  mesh.position.y -= this.getMinHeight();

  return mesh;
};

Terrain.prototype.toShadedMesh = function (width, increments, color) {
  return this._toMesh(width, increments, false, color);
};

Terrain.prototype.toWireframeMesh = function (width, increments, color) {
  return this._toMesh(width, increments, true, color);
};

Terrain.prototype.createTexture = function (width, increments) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = width;

  var increment = width / increments;

  var ctx = canvas.getContext('2d');

  var minHeight = this.getMinHeight();
  var maxHeight = this.getMaxHeight();

  for (var y = 0; y < increments; y++) {
    for (var x = 0; x < increments; x++) {

      var height = this.get(Math.floor(x * increment * this.size / width),
        Math.floor(y * increment * this.size / width));

      ctx.fillStyle = getColor(height);

      ctx.fillRect(x * increment, y * increment, increment, increment);
    }
  }

  return new THREE.CanvasTexture(canvas);
};

function getColor(value) {

  // Deep Ocean
  var rgb = [181, 186, 136];

  // Sand
  if (value >= 200) {
    rgb = [244, 255, 148];
  }

  // Light Grass
  if (value >= 260) {
    rgb = [48, 140, 48];
  }

  // Dark Grass
  if (value >= 280) {
    rgb = [54, 117, 43];
  }

  // Rock
  if (value >= 300) {
    rgb = [99, 99, 99];
  }

  // Snow
  if (value >= 360) {
    rgb = [240, 240, 240];
  }

  var color = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';

  return color;
}

AFRAME.registerComponent('terrain', {
  schema: {
    detail: { type: 'int', default: 5 },
    sharpness: { type: 'number', default: 0.5 },
    width: { type: 'int', default: 100 },
    increments: { type: 'int', default: 20 },
    color: { type: 'color', default: '#ff0' }
  },
  init: function () {},
  update: function () {
    var data = this.data,
        el = this.el;

    var terrain = new Terrain(data.detail);

    terrain.generate(data.sharpness);

    var mesh = terrain.toShadedMesh(data.width, data.increments, data.color);

    var raycaster = new THREE.Raycaster();
    raycaster.set(new THREE.Vector3(0, -10, 0), new THREE.Vector3(0, 1, 0), 0, 1000);

    var interations = 0,
        maxIterations = 50;

    while(raycaster.intersectObject(mesh).length && interations < maxIterations) {
      terrain.generate(data.sharpness);

      mesh = terrain.toShadedMesh(data.width, data.increments, data.color);

      interations++;
    }

    this.el.setObject3D('mesh', mesh);
  },
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});

AFRAME.registerPrimitive('a-terrain', {
  defaultComponents: {
    terrain: {}
  },
  mappings: {
    detail: 'terrain.detail',
    sharpness: 'terrain.sharpness',
    width: 'terrain.width',
    increments: 'terrain.increments',
    color: 'terrain.color'
  }
});
