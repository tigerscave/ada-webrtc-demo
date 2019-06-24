'use strict';

const init = () => {
  var container, mesh, container2;
  container = document.getElementById( 'container' );
  container2 = document.getElementById( 'container2' );
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera.target = new THREE.Vector3( 0, 0, 0 );
  
  camera2 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera2.target = new THREE.Vector3( 0, 0, 0 );

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

  renderer2 = new THREE.WebGLRenderer();
  renderer2.setPixelRatio( window.devicePixelRatio );
  renderer2.setSize( window.innerWidth / 2, window.innerHeight / 2 );

  container.appendChild( renderer.domElement );
  container2.appendChild( renderer2.domElement );
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );

  window.addEventListener( 'resize', onWindowResize, false );
}

const animate = () => {
  requestAnimationFrame( animate );
  update();
}

const update = () => {
  let l = Math.max( - 85, Math.min( 85, 0 ) );
  phi = THREE.Math.degToRad( 90 - 0 );
  theta = THREE.Math.degToRad( 0 );
  camera.position.x = distance * Math.sin( phi ) * Math.cos( theta );
  camera.position.y = distance * Math.cos( phi );
  camera.position.z = distance * Math.sin( phi ) * Math.sin( theta );
  camera.lookAt( camera.target );


  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi2 = THREE.Math.degToRad( 90 - lat );
  theta2= THREE.Math.degToRad( lon );

  camera2.position.x = distance * Math.sin( phi2 ) * Math.cos( theta2 );
  camera2.position.y = distance * Math.cos( phi2 );
  camera2.position.z = distance * Math.sin( phi2 ) * Math.sin( theta2 );
  camera2.lookAt( camera2.target );

  renderer.render( scene, camera );
  renderer2.render( scene, camera2 );
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();

  renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );
  renderer2.setSize( window.innerWidth / 2, window.innerHeight / 2 );
}

var camera, camera2, scene, renderer, renderer2;
var isUserInteracting = false,
  lon = 180, lat = 0,
  phi = 0, theta = 0,
  phi2 = 0, theta2 = 0,
  distance = 50,
  onPointerDownPointerX = 0,
  onPointerDownPointerY = 0,
  onPointerDownLon = 0,
  onPointerDownLat = 0;

const onDocumentMouseDown = ( event ) => {
  event.preventDefault();
  isUserInteracting = true;
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon;
  onPointerDownLat = lat;
}

const onDocumentMouseMove = ( event ) => {
  if ( isUserInteracting === true ) {
    lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
    lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
  }
}

const onDocumentMouseUp = () => {
  isUserInteracting = false;
}

document.getElementById('videoContainer').style.display = "unset";

document.getElementById('vrButton').addEventListener('click', () => {
  init();
  animate();
  document.getElementById("videoContainer").style.display = 'none';
})