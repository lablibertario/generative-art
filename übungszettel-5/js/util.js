function addObjectsToScene(scene, objects) {

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

  var material = material || new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });

  return new THREE.Points(geometry, material);
}

function createSphere(position, material) {
  var geometry = new THREE.SphereGeometry(1, 8, 8);

  var material = material || new THREE.MeshLambertMaterial({ color: 0xffffff, overdraw: 0.5 });

  var sphere = new THREE.Mesh(geometry, material);

  sphere.position.add(position);

  return sphere;
}

function createCube(position, material) {
  var geometry = new THREE.BoxGeometry(2, 2, 2);

  var material = new THREE.MeshLambertMaterial({ color: 0xffffff, overdraw: 0.5 });

  var cube = new THREE.Mesh(geometry, material);

  cube.position.add(position);

  return cube;
}
