import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {};
debugObject.createSphere = () => {
    createSphere(
        Math.random() * 0.5,
        new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            3,
            (Math.random() - 0.5) * 3
        )
    )
}
debugObject.createBox = () => {
    createBox(
        new THREE.Vector3(
            Math.random() * 0.5,
            Math.random() * 0.5,
            Math.random() * 0.5
        ),
        new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            3,
            (Math.random() - 0.5) * 3
        )
    )
}
debugObject.reset = () => {
    for(const object of objectsToUpdate){
        //Remove body
        object.body.removeEventListener('collide', playHitSound);
        world.removeBody(object.body);
        //Remove mesh
        scene.remove(object.mesh);
    }
    objectsToUpdate.splice(0, objectsToUpdate.length);
}
gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')
gui.add(debugObject, 'reset')


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3');

const playHitSound = (collision) => {
    //Second problem is that we hear too many sounds when a cub slightly touches
    //So if there is enough impact strength then we play the sound
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength > 1.5){
        //reset the the sound, while the sound is playing nothing happens
        hitSound.currentTime = 0; 
        hitSound.volume = impactStrength * 0.1;
        hitSound.play();
    }
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

//Materials
//Reference material, going to use those contact material to define how two materials interact with each other
// const concreteMaterial = new CANNON.Material('concrete');
// const plasticMaterial = new CANNON.Material('plastic');
//Need to have this contact material created
// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
//     concreteMaterial,
//     plasticMaterial,
//     {
//         friction: 0.1, //resistance to slide
//         restitution: 0.7 //bounciness 
//     }
// );
// world.addContactMaterial(concretePlasticContactMaterial)

const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1, //resistance to slide
        restitution: 0.7 //bounciness 
    }
);
world.addContactMaterial(defaultContactMaterial); //apply to all materials that are not defined
world.defaultContactMaterial = defaultContactMaterial

//Sphere
//Same radius as our sphere geometry
// const sphereShape = new CANNON.Sphere(0.5);

// //Creat the body and mass and a position
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, 3, 0),
//     shape: sphereShape,
// })
// sphereBody.applyLocalForce(new CANNON.Vec3(150,0,0), new CANNON.Vec3(0,0,0)) //apply force to the center of the sphere
// world.addBody(sphereBody);

//floor body
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body()
floorBody.mass = 0; //object is static and it won't move
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0), Math.PI / 2); //rotate plane to be horizontal
floorBody.addShape(floorShape);
world.addBody(floorBody);   

/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Function to create sphere (UTIL)
 */
const objectsToUpdate = [];
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
})
const createSphere = (radius, position )=> {
    //ThreeJS mesh
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
    )
    mesh.scale.set(radius, radius, radius); 
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh);


    //Physics world
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,    
        gravity: -9.81,
        position: new CANNON.Vec3(0,3,0),
        shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    world.addBody(body);
    body.addEventListener('collide', playHitSound);
    //Save in objects to update
    objectsToUpdate.push({
        mesh,
        body
    })
}

createSphere(0.5, new THREE.Vector3(0,3,0));



const boxGeometry = new THREE.BoxGeometry(1,1,1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
})
const createBox = (size, position )=> {
    //ThreeJS mesh
    const mesh = new THREE.Mesh(
        boxGeometry,
        boxMaterial
    )
    mesh.scale.set(size.x, size.y, size.z); 
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh);
    //Physics world
    //cannon js's box starts from the center of the box, so we need to half the size
    const shape = new CANNON.Box(new CANNON.Vec3(size.x *0.5, size.y*0.5, size.z*0.5));
    const body = new CANNON.Body({
        mass: 1,    
        gravity: -9.81,
        position: new CANNON.Vec3(0,3,0),
        shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    world.addBody(body);
    body.addEventListener('collide', playHitSound);
    //Save in objects to update
    objectsToUpdate.push({
        mesh,
        body
    })
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldEslapsedTime = 0;
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldEslapsedTime;
    oldEslapsedTime = elapsedTime;


    //Physics world
    // sphereBody.applyForce(new CANNON.Vec3(-0.5,0,0), sphereBody.position) //continuous force to the left

    world.step(1/60, deltaTime, 3)
    //Update sphere position event though vec3 !== vector3 it is ok
    // sphere.position.copy(sphereBody.position)

    for(const object of objectsToUpdate){
        object.mesh.position.copy(object.body.position);
        //important to update rotation as well
        object.mesh.quaternion.copy(object.body.quaternion);
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()