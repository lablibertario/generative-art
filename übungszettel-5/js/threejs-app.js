'use strict';

function ThreeApp(options) {
  App.call(this, options);
}

ThreeApp.prototype = Object.create(App.prototype);
ThreeApp.prototype.constructor = ThreeApp;

ThreeApp.prototype.init = function(options) {

  var that = this;

  this.clock = new THREE.Clock();

  this.renderer.shadowMapEnabled = true;

  this.scene.fog = new THREE.FogExp2(0x000000, 0.0005);

  var pointLight = new THREE.PointLight(0xffffff, 1, 500);
  pointLight.position.set(100, 200, 100);

  this.scene.add(pointLight);

  var ambientLight = new THREE.AmbientLight(0x808080);

  this.scene.add(ambientLight);

  this.useWorker = window.Worker ? true : false;

  this.worker = new Worker('js/worker.js');

  this.worker.onmessage = function(e) {
    that.onTerrainGenerated(e.data)
  };

  this.terrainGroup = new THREE.Group();
  addObjectsTo(this.scene, this.terrainGroup);

  this.generateTerrain();

  this.threeDCursor = create3DCursor(new THREE.Vector3(0));

  this.keyFrameMarkers = [];
  this.keyFrameMarkerGroup = new THREE.Group();
  addObjectsTo(this.scene, this.keyFrameMarkerGroup);

  addObjectsTo(this.scene, this.threeDCursor);

  // controls
  if (options.controls) {
    this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    // this.orbitControls.addEventListener('change', render); // add this only if there is no animation loop (requestAnimationFrame)
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.5;
    this.orbitControls.enableZoom = true;
  }

  this.raycaster = new THREE.Raycaster();
};

ThreeApp.prototype.onTerrainGenerated = function(data) {
  this.scene.remove(this.terrainGroup);
  this.terrainGroup = new THREE.Group();
  this.scene.add(this.terrainGroup);

  this.terrain = new Terrain(data.detail);

  this.terrain.setMap(data.map);

  addObjectsTo(this.terrainGroup, this.terrain[this.mode](this.width, this.increments));
};

ThreeApp.prototype.update = function () {
  this.orbitControls.update();

  // camera rotation
  var r = 100;
  var rotationSpeed = 0.5;

  if (this.rotateCamera) {
    this.camera.position.x = 0 + r * Math.sin(2 * Math.PI * this.time / (1000 / rotationSpeed));
    this.camera.position.y = 50 + r / 4 * Math.sin(2 * Math.PI * this.time / (1000 / rotationSpeed));
    this.camera.position.z = 0 + r * Math.cos(2 * Math.PI * this.time / (1000 / rotationSpeed));

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  // intersecting
  this.raycaster.setFromCamera(this.mouse, this.camera);

  var intersects = this.raycaster.intersectObjects(this.terrainGroup.children);

  if (intersects.length) {
    this.threeDCursor.children[0].material.visible = true;

    var position;

    if (intersects[0].object.geometry instanceof THREE.PlaneGeometry) {
      position = intersects[0].object.geometry.vertices[ intersects[0].face.a ];

      position = intersects[0].point;
    } else if (this.isKeyFrameMarker(intersects[0].object)) {
      // TODO remove marker on click
    } else {
      position = intersects[0].object.position;
    }

    this.threeDCursor.position.set(position.x, position.y, position.z);

    if (this.mouseDown && !this.hasKeyFrameMarker(position)) {
      var keyFrameMarker = createKeyFrameMarker(position);

      addObjectsTo(this.keyFrameMarkerGroup, keyFrameMarker);

      this.keyFrameMarkers.push(keyFrameMarker);
    }
  } else {
    this.threeDCursor.children[0].material.visible = false;
  }
};

ThreeApp.prototype.updateTerrain = function(mode) {
  this.scene.remove(this.terrainGroup);
  this.terrainGroup = new THREE.Group();
  this.scene.add(this.terrainGroup);

  addObjectsTo(this.terrainGroup, this.terrain[mode || this.mode](this.width, this.increments));
}

ThreeApp.prototype.generateTerrain = function(detail, sharpness) {
  detail = detail || this.detail || 5;
  sharpness = sharpness || this.sharpness || 0.5;

  if (this.useWorker) {
    this.worker.postMessage({
      detail: detail,
      sharpness: sharpness
    });
  } else {
    var terrain = new Terrain(detail);
    terrain.generate(sharpness);

    this.onTerrainGenerated({
      detail: detail,
      map: terrain.map
    });
  }

};

ThreeApp.prototype.hasKeyFrameMarker = function(position) {
  var hasKeyFrameMarker = false;

  var positionClone = position.clone();

  this.keyFrameMarkers.forEach(function(marker) {
    if (marker.position.clone().sub(position).length() < 0.1) {
      hasKeyFrameMarker = true;
    }
  });

  return hasKeyFrameMarker;
};

ThreeApp.prototype.isKeyFrameMarker = function(object) {
  var isKeyFrameMarker = false;

  this.keyFrameMarkers.forEach(function(marker) {

    if (marker === object) {


      hasKeyFrameMarker = true;
    }
  });

  return isKeyFrameMarker;
}

ThreeApp.prototype.clearKeyFrameMarkers = function(position) {

}
