'use strict';

function ThreeApp(options) {
  App.call(this, options);
}

ThreeApp.prototype = Object.create(App.prototype);
ThreeApp.prototype.constructor = ThreeApp;

ThreeApp.prototype.init = function(options) {

  var that = this;

  // animation camera
  this.editorCamera = this.camera;
  this.animationCamera = new THREE.PerspectiveCamera(
	   45, this.aspectRatio, this.nearPlane, this.farPlane);

  this.currentCamera = this.editorCamera;

  this.view = 'editor';

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

  this.animatedObject = this.animationCamera;

  addObjectsTo(this.scene, this.animatedObject);

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

  // automatic camera rotation
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

    if (this.view === 'editor') {
      this.threeDCursor.children[0].material.visible = true;
    }

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

      this.updateAnimation();
    }
  } else {
    this.threeDCursor.children[0].material.visible = false;
  }

  // key frame marker animation
  var offset = new THREE.Vector3(0, Math.sin(this.time / 10) * 0.05, 0);

  this.keyFrameMarkers.forEach(function(marker) {
    marker.position.add(offset);
  });

  // animation
  if (this.animation) {
    var data = this.animation.getData(this.time - this.currentAnimationStartTime, tweenEased);

    var position = data[0];
    var lookAtPosition = data[1];

    this.animatedObject.position.set(position.x, position.y, position.z);

    this.animatedObject.lookAt(lookAtPosition);
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

  this.clearKeyFrameMarkers();

  this.stopAnimation();
};

ThreeApp.prototype.hasKeyFrameMarker = function(position) {
  var hasKeyFrameMarker = false;

  var positionClone = position.clone();

  this.keyFrameMarkers.forEach(function(marker) {
    if (marker.position.x - position.x < 0.1
        && marker.position.z - position.z < 0.1) {
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
};

ThreeApp.prototype.clearKeyFrameMarkers = function(position) {
  if (!this.keyFrameMarkers) {
    return;
  }

  this.keyFrameMarkers.forEach(function(marker) {
    marker.parent.remove(marker);
  });

  this.keyFrameMarkers = [];
};

ThreeApp.prototype.setKeyFrameMarkersVisible = function(visible) {
  if (!this.keyFrameMarkers || !this.keyFrameMarkers.length) {
    return;
  }

  if (this.keyFrameMarkers.length) {
    this.keyFrameMarkers[0].children[0].material.visible = visible;
  }
}

ThreeApp.prototype.startAnimation = function() {

  if (!this.keyFrameMarkers || !this.keyFrameMarkers.length) {
    return;
  }

  this.animation = new Animation();

  this.animation.setIsLooping(true);

  this.updateAnimation();

  this.currentAnimationStartTime = this.time;

  this.setView('animation');
};

ThreeApp.prototype.stopAnimation = function() {
  this.animation = undefined;

  this.setView('editor');
};

ThreeApp.prototype.updateAnimation = function() {

  if (!this.keyFrameMarkers.length || !this.animation) {
    return;
  }

  this.animation.keyFrames = [];

  var totalTime = 0;

  for (var i = 0; i < this.keyFrameMarkers.length; i++) {
    var time = 0;

    if (i > 0) {
      var sectionTime = 10 * this.keyFrameMarkers[i].position.clone().sub(this.keyFrameMarkers[i - 1].position).length()
        / this.animationSpeed;

      time = totalTime + sectionTime;

      totalTime += sectionTime;
    }

    var position = this.keyFrameMarkers[i].position.clone().add(new THREE.Vector3(0, 16, 0));

    var nextIndex;

    if (i + 1 < this.keyFrameMarkers.length) {
      nextIndex = i + 1;
    } else {
      nextIndex = 0;
    }

    var lookAtPosition = this.keyFrameMarkers[nextIndex].position.clone().add(new THREE.Vector3(0, 16, 0));

    var keyFrame = {
      time: time,
      data: [
        { type: 'vector', data: position },
        { type: 'vector', data: lookAtPosition }
      ]
    };

    this.animation.addKeyFrame(keyFrame);

    // loop animation path
    if (i === this.keyFrameMarkers.length - 1) {
      time = totalTime + 10 * this.keyFrameMarkers[i].position.clone().sub(this.keyFrameMarkers[0].position).length()
        / this.animationSpeed;

      position = this.keyFrameMarkers[0].position.clone().add(new THREE.Vector3(0, 16, 0));
      lookAtPosition = this.keyFrameMarkers[1].position.clone().add(new THREE.Vector3(0, 16, 0));

      var loopKeyFrame = {
        time: time,
        data: [
          { type: 'vector', data: position },
          { type: 'vector', data: lookAtPosition }
        ]
      };

      this.animation.addKeyFrame(loopKeyFrame);
    }
  }
};

ThreeApp.prototype.setView = function(view) {
  this.view = view;

  if (view === 'editor') {
    this.setCamera(this.editorCamera);

    if (this.threeDCursor) {
      this.threeDCursor.children[0].material.visible = true;
    }

    this.setKeyFrameMarkersVisible(true);
  } else {
    this.setCamera(this.animationCamera);

    if (this.threeDCursor) {
      this.threeDCursor.children[0].material.visible = false;
    }

    this.setKeyFrameMarkersVisible(false);
  }
};

ThreeApp.prototype.setCamera = function(camera) {
  this.camera = camera;
  this.currentCamera = camera;
}
