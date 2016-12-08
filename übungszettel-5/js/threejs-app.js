'use strict';

function ThreeApp(config) {
  App.call(this, config);
}

ThreeApp.prototype = Object.create(App.prototype);
ThreeApp.prototype.constructor = ThreeApp;

ThreeApp.prototype.init = function () {

  var that = this;

  var pointLight = new THREE.PointLight(0xffffff, 1, 500);
  pointLight.position.set(100, 100, 100);

  this.scene.add(pointLight);

  var ambientLight = new THREE.AmbientLight(0x808080);

  this.scene.add(ambientLight);

  this.useWorker = window.Worker ? true : false;

  this.worker = new Worker('js/worker.js');

  this.worker.onmessage = function(e) {
    that.onTerrainGenerated(e.data)
  };

  this.terrainGroup = new THREE.Group();
  addObjectsToScene(this.scene, this.terrainGroup);

  this.generateTerrain();

  // controls
  this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  // this.orbitControls.addEventListener('change', render); // add this only if there is no animation loop (requestAnimationFrame)
  this.orbitControls.enableDamping = true;
  this.orbitControls.dampingFactor = 0.5;
  this.orbitControls.enableZoom = true;

  console.log(this.orbitControls);
};

ThreeApp.prototype.onTerrainGenerated = function(data) {
  this.scene.remove(this.terrainGroup);
  this.terrainGroup = new THREE.Group();
  this.scene.add(this.terrainGroup);

  this.terrain = new Terrain(data.detail);

  this.terrain.setMap(data.map);

  addObjectsToScene(this.terrainGroup, this.terrain[this.mode](this.width, this.increments));
};

ThreeApp.prototype.update = function () {
  this.orbitControls.update();

  var r = 100;
  var rotationSpeed = 0.5;

  if (this.rotateCamera) {
    this.camera.position.x = 0 + r * Math.sin(2 * Math.PI * this.time / (1000 / rotationSpeed));
    this.camera.position.y = 50 + r / 4 * Math.sin(2 * Math.PI * this.time / (1000 / rotationSpeed));
    this.camera.position.z = 0 + r * Math.cos(2 * Math.PI * this.time / (1000 / rotationSpeed));

    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }
};

ThreeApp.prototype.updateTerrain = function(mode) {
  this.scene.remove(this.terrainGroup);
  this.terrainGroup = new THREE.Group();
  this.scene.add(this.terrainGroup);

  addObjectsToScene(this.terrainGroup, this.terrain[mode || this.mode](this.width, this.increments));
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
