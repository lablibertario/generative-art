'use strict';

AFRAME.registerComponent('water', {
  schema: {
    width: { type: 'int', default: 500 },
    increments: { type: 'int', default: 50 },
    color: { type: 'color', default: '#00f' },
    frequency: { type: 'number', default: 1 },
    amplidute: { type: 'number', default: 1 }
  },
  init: function () {},
  update: function () {
    var data = this.data,
        el = this.el;

    var geometry = new THREE.PlaneGeometry(data.width, data.width, data.increments, data.increments);

    var material = new THREE.MeshPhongMaterial({
      color: data.color,
      shading: THREE.FlatShading,
      shininess: 1,
      transparent: true,
      opacity: 0.9
    } );

    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = radians(-90);

    this.el.setObject3D('mesh', plane);
  },
  tick: function (time, timeDelta) {
    var el = this.el,
        data = this.data,
        geometry = el.getObject3D('mesh').geometry;

    geometry.vertices.forEach(function(vertex, index) {
      vertex.z = Math.abs(Math.sin(random(index) * (time / 500 * data.frequency )) * 2 * data.amplidute);
    });

    geometry.verticesNeedUpdate = true;
  },
  remove: function () {},
  pause: function () {},
  play: function () {}
});

AFRAME.registerPrimitive('a-water', {
  defaultComponents: {
    water: {}
  },
  mappings: {
    width: 'water.width',
    increments: 'water.increments',
    color: 'water.color',
    frequency: 'water.frequency',
    amplidute: 'water.amplidute'
  }
});

function radians(degrees) {
  return degrees * Math.PI / 180;
};

function random(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
