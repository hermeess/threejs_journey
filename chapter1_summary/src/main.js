import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//Adding GUI
const gui = new GUI();

//Scene
const scene = new THREE.Scene();

//Canvas
const canvas = document.querySelector("canvas.webgl");

//Textures
const textureLoaders = new THREE.TextureLoader();

//sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //Update renders
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Objects
 */
const bubble = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 16),
  new THREE.MeshBasicMaterial({
    wireframe: true,
  })
);
bubble.position.set(0, 0, 0);
gui.addColor(bubble.material, "color");

scene.add(bubble);

//Camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 1, 5);
scene.add(camera);

const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//Reneder
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

window.addEventListener("keydown", (event) => {
  if (event.type === "keydown" && event.code === "Space") {
    //Expand the circle until user release
    // bubble.
  }
});

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
