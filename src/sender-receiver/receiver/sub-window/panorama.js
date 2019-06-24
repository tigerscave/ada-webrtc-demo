'use strict';

const init = () => {
  var container, mesh;
  container = document.getElementById( 'container' );
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera.target = new THREE.Vector3( 0, 0, 0 );
  scene = new THREE.Scene();
  var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
  // invert the geometry on the x-axis so that all of the faces point inward
  geometry.scale( - 1, 1, 1 );
  var video = document.getElementById( 'subVideo' );
  video.play();
  var texture = new THREE.VideoTexture( video );
  var material = new THREE.MeshBasicMaterial( { map: texture } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );
  container.appendChild( renderer.domElement );
  // document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  // document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  // document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  // //
  window.addEventListener( 'resize', onWindowResize, false );
}

const animate = () => {
  requestAnimationFrame( animate );
  update();
}

const update = () => {
  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );
  camera.position.x = distance * Math.sin( phi ) * Math.cos( theta );
  camera.position.y = distance * Math.cos( phi );
  camera.position.z = distance * Math.sin( phi ) * Math.sin( theta );
  camera.lookAt( camera.target );
  renderer.render( scene, camera );
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );
}

var camera, scene, renderer;
var isUserInteracting = false,
  lon = 0, lat = 0,
  phi = 0, theta = 0,
  distance = 50,
  onPointerDownPointerX = 0,
  onPointerDownPointerY = 0,
  onPointerDownLon = 0,
  onPointerDownLat = 0;

document.getElementById('videoContainer').style.display = "unset";

document.getElementById('vrButton').addEventListener('click', () => {
  init();
  animate();
  document.getElementById("videoContainer").style.display = 'none';
})