import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap';

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ede60c'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        meshMaterial.color.set(parameters.materialColor)
    })

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        particleMaterial.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('./textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter


const objectsDistance = 4;

//Materials
const meshMaterial = new THREE.MeshToonMaterial({color: parameters.materialColor, gradientMap: gradientTexture})

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), meshMaterial);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), meshMaterial);

const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), meshMaterial);

mesh1.position.y = - objectsDistance * 0;
mesh2.position.y = - objectsDistance * 1;
mesh3.position.y = - objectsDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Particles
 */
//Geometry
const particlesCount = 200;
const particles = new Float32Array(particlesCount * 3);

for(let i =0 ; i < particlesCount; i++){
    particles[i * 3 + 0] = (Math.random() - 0.5) * 10;
    particles[i * 3 + 1] = objectsDistance * 0.5  - Math.random() * objectsDistance * sectionMeshes.length;
    particles[i * 3 + 2] =  (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
//Positions and how many values per vertex
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true, //particles feel smaller or larger
    size: 0.03,
})

const particlesMesh = new THREE.Points(particlesGeometry, particleMaterial);
scene.add(particlesMesh);


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
//Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * scroll
 */
let scrollY = window.scrollY;
let currSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;

    const newSection = Math.round(scrollY / sizes.height);
   
   if(newSection != currSection){
    currSection = newSection;
    

    //GSAP to animate
    gsap.to(sectionMeshes[currSection].rotation, {
        duration: 1.5,
        ease: 'power2.inOut',
        x:  "+=6",
        y:  "+=3", 
        z: "+=1.5"
    })
   } 
})

const cursor = {
    x: 0,
    y: 0,
}
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX /sizes.width -0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
    console.log(cursor);
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    //animate camera
    camera.position.y = -scrollY / sizes.height * objectsDistance 

    //Parallex effect
    const parallexX = cursor.x * 0.5;

    //When scrolling down we need negate
    const parallexY = -cursor.y * 0.5;


    //Delta time is very slow
    cameraGroup.position.x += (parallexX -cameraGroup.position.x) * 5 * deltaTime;
    cameraGroup.position.y += (parallexY-cameraGroup.position.y) * 5 * deltaTime;
    
    

    //animate meshers
    for(const mesh of sectionMeshes){
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()