'use strict';

if(typeof importScripts === 'function') {

  importScripts('terrain.js');

  onmessage = function(e) {
    var terrain = new Terrain(e.data.detail);
    terrain.generate(e.data.sharpness);

    postMessage({
      detail: e.data.detail,
      map: terrain.map
    });
  }

}
