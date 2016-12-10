var pointsMaterial = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false }),
    lambertMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, overdraw: 0.5 }),
    cursorMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
  		opacity: 0.5,
  		transparent: true,
      visible: false
  	}),
    keyFrameMarkerMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
  		opacity: 0.5,
  		transparent: true
  	}),
    animatedObjectMaterial = new THREE.MeshLambertMaterial({
      color: 0x0000ff,
  		opacity: 0.5,
  		transparent: true
  	});

function addObjectsTo(scene, objects) {

  if (!objects.length) {
    objects = [ objects ];
  }

  objects.forEach(function(object) {
    scene.add(object);
  });
}

function createPoint(position, material) {
  var geometry = new THREE.Geometry();
  geometry.vertices.push(position);

  var material = material || pointsMaterial;

  return new THREE.Points(geometry, material);
}

function createSphere(position, material) {
  var geometry = new THREE.SphereGeometry(2, 8, 8);

  var material = material || lambertMaterial;

  var sphere = new THREE.Mesh(geometry, material);

  sphere.position.add(position);

  return sphere;
}

function createCube(position, material) {
  var geometry = new THREE.BoxGeometry(2, 2, 2);

  var material = material || lambertMaterial;

  var cube = new THREE.Mesh(geometry, material);

  cube.position.add(position);

  return cube;
}

function createCone(position, material) {
  var geometry = new THREE.CylinderGeometry(2, 0, 16, 16);

  var material = material || lambertMaterial;

  var cone = new THREE.Mesh(geometry, material);

  cone.position.add(position);

  return cone;
}

function create3DCursor(position) {
  var parent = new THREE.Object3D();

  parent.position.add(position);

  // cone
  var cone = createCone(new THREE.Vector3(0, 8, 0), cursorMaterial);

  parent.add(cone);

  return parent;
}

function createKeyFrameMarker(position, material) {
  var parent = new THREE.Object3D();

  parent.position.add(position);

  var cone = createCone(new THREE.Vector3(0, 8, 0), material || keyFrameMarkerMaterial);

  parent.add(cone)

  return parent;
}

function createAnimatedObject(position, material) {
  var parent = new THREE.Object3D();

  parent.position.add(position);

  var cone = createCone(new THREE.Vector3(0, 8, 0), material || animatedObjectMaterial);

  cone.rotation.x = Math.PI / 2;

  parent.add(cone)

  return parent;
}
