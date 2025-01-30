import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

console.log("✅ Three.js loaded successfully with Vite!");

// === Scene, Camera, Renderer Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// === Lighting ===
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 100, 1000, 100 );
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
scene.add(spotLight);

// === plane ===
const geometry = new THREE.PlaneGeometry( 2000, 2000 );
geometry.rotateX( - Math.PI / 2 );

const material = new THREE.ShadowMaterial();
material.opacity = 0.2;

const plane = new THREE.Mesh( geometry, material );
plane.position.y = -200;
plane.receiveShadow = true;
scene.add( plane );


// === Load HDR Environment ===
new RGBELoader().load("assets/qwantani_sunset_1k.hdr", (hdrTexture) => {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = hdrTexture;
    scene.environment = hdrTexture;
});

// === Model Loaders Mapping ===
const loaders = {
    glb: new GLTFLoader(),
    gltf: new GLTFLoader(),
    obj: new OBJLoader(),
    fbx: new FBXLoader(),
};

// === Load Model ===
function loadModel(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!loaders[extension]) {
        alert("Unsupported file format! Please upload a GLB, GLTF, OBJ, or FBX file.");
        console.error("Unsupported format:", extension);
        return;
    }

    console.log("Uploading file:", file.name);
    const url = URL.createObjectURL(file);

    loaders[extension].load(url, (model) => {
        addModelToScene(extension === "glb" || extension === "gltf" ? model.scene : model);
    });
}

// === Add Model to Scene ===
function addModelToScene(model) {
    scene.add(model);
    console.log("Model added:", model);

    // Apply HDR reflections
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.envMap = scene.environment;
            child.material.needsUpdate = true;
        }
    });

    // Center the model in the scene
    const bbox = new THREE.Box3().setFromObject(model);
    model.position.sub(bbox.getCenter(new THREE.Vector3()));
}

// === Handle File Upload ===
document.getElementById("fileInput")?.addEventListener("change", (event) => {
    if (event.target.files.length > 0) {
        loadModel(event.target.files[0]);
    }
});


// === Animation Loop ===
function animate(time) {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    if(time%1==0){
        console.log(renderer.info);
    }

}
animate();
