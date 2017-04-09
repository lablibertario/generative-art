'use strict';

AFRAME.registerSystem('sun', {
  init: function() {
    var sceneEl = this.sceneEl;
    var directionalLight;
    var sky;

    directionalLight = this.directionalLight = document.createElement('a-entity');
    directionalLight.setAttribute('light', {color: '#FFF', intensity: 0.6});
    directionalLight.setAttribute('position', {x: -0.5, y: 1, z: 1});
    sceneEl.appendChild(directionalLight);

    sky = this.sky = sceneEl.querySelector('a-sky');
  },

  tick: function(time) {
    var duration = 5000;

    var x = Math.sin(time / duration) * 0.5;
    var z = Math.sin(time / duration) * 0.1;

    this.directionalLight.setAttribute('position', {x: x, y: 1, z: z});

    var color = '#FFFFFF';
    var intensity = Math.sin(time / duration) / 2 + 0.5;

    this.directionalLight.setAttribute('light', {color: color, intensity: intensity * 0.8 + 0.2});

    var lightness = 0 + Math.floor(10 * intensity);

    this.sky.setAttribute('material', 'color', 'hsla(0, 0%, ' + lightness + '%, 1)');

    this.sceneEl.setAttribute('fog', 'color', 'hsla(0, 0%, ' + lightness + '%, 1)');
  }
});
