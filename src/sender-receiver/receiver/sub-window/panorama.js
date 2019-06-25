'use strict';

const init = () => {
  var container, mesh, container2, container3, container4;
  container = document.getElementById( 'container' );
  container2 = document.getElementById( 'container2' );
  container3 = document.getElementById( 'container3' );
  container4 = document.getElementById( 'container4' );
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera.target = new THREE.Vector3( 0, 0, 0 );
  
  camera2 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera2.target = new THREE.Vector3( 0, 0, 0 );

  camera3 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera3.target = new THREE.Vector3( 0, 0, 0 );

  camera4 = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  camera4.target = new THREE.Vector3( 0, 0, 0 );

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

  renderer3 = new THREE.WebGLRenderer();
  renderer3.setPixelRatio( window.devicePixelRatio );
  renderer3.setSize( window.innerWidth / 2, window.innerHeight / 2 );

  renderer4 = new THREE.WebGLRenderer();
  renderer4.setPixelRatio( window.devicePixelRatio );
  renderer4.setSize( window.innerWidth / 2, window.innerHeight / 2 );

  container.appendChild( renderer.domElement );
  container.addEventListener( 'mousedown', onDocumentMouseDown, false );
  container.addEventListener( 'mousemove', onDocumentMouseMove, false );
  container.addEventListener( 'mouseup', onDocumentMouseUp, false );
  container.addEventListener( 'mouseleave', onDocumentMouseUp, false );

  container2.appendChild( renderer2.domElement );
  container2.addEventListener( 'mousedown', onDocumentMouseDown2, false );
  container2.addEventListener( 'mousemove', onDocumentMouseMove2, false );
  container2.addEventListener( 'mouseup', onDocumentMouseUp2, false );
  container2.addEventListener( 'mouseleave', onDocumentMouseUp2, false );

  container3.appendChild( renderer3.domElement );
  container3.addEventListener( 'mousedown', onDocumentMouseDown3, false );
  container3.addEventListener( 'mousemove', onDocumentMouseMove3, false );
  container3.addEventListener( 'mouseup', onDocumentMouseUp3, false );
  container3.addEventListener( 'mouseleave', onDocumentMouseUp3, false );

  container4.appendChild( renderer4.domElement );
  container4.addEventListener( 'mousedown', onDocumentMouseDown4, false );
  container4.addEventListener( 'mousemove', onDocumentMouseMove4, false );
  container4.addEventListener( 'mouseup', onDocumentMouseUp4, false );
  container4.addEventListener( 'mouseleave', onDocumentMouseUp4, false );

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

  lat2 = Math.max( - 85, Math.min( 85, lat2 ) );
  phi2 = THREE.Math.degToRad( 90 - lat2 );
  theta2= THREE.Math.degToRad( lon2 );

  camera2.position.x = distance * Math.sin( phi2 ) * Math.cos( theta2 );
  camera2.position.y = distance * Math.cos( phi2 );
  camera2.position.z = distance * Math.sin( phi2 ) * Math.sin( theta2 );
  camera2.lookAt( camera2.target );

  lat3 = Math.max( - 85, Math.min( 85, lat3 ) );
  phi3 = THREE.Math.degToRad( 90 - lat3 );
  theta3= THREE.Math.degToRad( lon3 );

  camera3.position.x = distance * Math.sin( phi3 ) * Math.cos( theta3 );
  camera3.position.y = distance * Math.cos( phi3 );
  camera3.position.z = distance * Math.sin( phi3 ) * Math.sin( theta3 );
  camera3.lookAt( camera3.target );

  lat4 = Math.max( - 85, Math.min( 85, lat4 ) );
  phi4 = THREE.Math.degToRad( 90 - lat4 );
  theta4 = THREE.Math.degToRad( lon4 );

  camera4.position.x = distance * Math.sin( phi4 ) * Math.cos( theta4 );
  camera4.position.y = distance * Math.cos( phi4 );
  camera4.position.z = distance * Math.sin( phi4 ) * Math.sin( theta4 );
  camera4.lookAt( camera4.target );

  renderer.render( scene, camera );
  renderer2.render( scene, camera2 );
  renderer3.render( scene, camera3 );
  renderer4.render( scene, camera4 );

}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();

  camera3.aspect = window.innerWidth / window.innerHeight;
  camera3.updateProjectionMatrix();

  camera4.aspect = window.innerWidth / window.innerHeight;
  camera4.updateProjectionMatrix();

  renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );
  renderer2.setSize( window.innerWidth / 2, window.innerHeight / 2 );
  renderer3.setSize( window.innerWidth / 2, window.innerHeight / 2 );
  renderer4.setSize( window.innerWidth / 2, window.innerHeight / 2 );
}

var camera, camera2, camera3, camera4, scene, renderer, renderer2, renderer3, renderer4;
var isUserInteracting = false,
  isUserInteracting2 = false,
  isUserInteracting3 = false,
  isUserInteracting4 = false,
  lon = 0, lat = 0,
  lon2 = 180, lat2 = 0,
  lon3 = 90, lat3 = 0,
  lon4 = 270, lat4 = 0,

  phi = 0, theta = 0,
  phi2 = 0, theta2 = 0,
  phi3 = 0, theta3 = 0,
  phi4 = 0, theta4 = 0,

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
    lon = ( onPointerDownPointerX - event.clientX ) * 0.3 + onPointerDownLon;
    lat = ( event.clientY - onPointerDownPointerY ) * 0.3 + onPointerDownLat;
  }
}

const onDocumentMouseUp = () => {
  isUserInteracting = false;
}

const onDocumentMouseDown2 = ( event ) => {
  event.preventDefault();
  isUserInteracting2 = true;
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon2;
  onPointerDownLat = lat2;
}

const onDocumentMouseMove2 = ( event ) => {
  if ( isUserInteracting2 === true ) {
    lon2 = ( onPointerDownPointerX - event.clientX ) * 0.3 + onPointerDownLon;
    lat2 = ( event.clientY - onPointerDownPointerY ) * 0.3 + onPointerDownLat;
  }
}

const onDocumentMouseUp2 = () => {
  isUserInteracting2 = false;
}

const onDocumentMouseDown3 = ( event ) => {
  event.preventDefault();
  isUserInteracting3 = true;
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon3;
  onPointerDownLat = lat3;
}

const onDocumentMouseMove3 = ( event ) => {
  if ( isUserInteracting3 === true ) {
    lon3 = ( onPointerDownPointerX - event.clientX ) * 0.3 + onPointerDownLon;
    lat3 = ( event.clientY - onPointerDownPointerY ) * 0.3 + onPointerDownLat;
  }
}

const onDocumentMouseUp3 = () => {
  isUserInteracting3 = false;
}

const onDocumentMouseDown4 = ( event ) => {
  event.preventDefault();
  isUserInteracting4 = true;
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon4;
  onPointerDownLat = lat4;
}

const onDocumentMouseMove4 = ( event ) => {
  if ( isUserInteracting4 === true ) {
    lon4 = ( onPointerDownPointerX - event.clientX ) * 0.3 + onPointerDownLon;
    lat4 = ( event.clientY - onPointerDownPointerY ) * 0.3 + onPointerDownLat;
  }
}

const onDocumentMouseUp4 = () => {
  isUserInteracting4 = false;
}

document.getElementById('videoContainer').style.display = "unset";

document.getElementById('vrButton').addEventListener('click', () => {
  init();
  animate();
  document.getElementById("videoContainer").style.display = 'none';
})