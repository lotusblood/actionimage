import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

console.log("✅ Three.js loaded successfully with Vite!");

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Track mouse movement
export let mousePosition = new THREE.Vector2(); // Global variable
const raycaster = new THREE.Raycaster();

document.addEventListener("mousemove", (event) => {
    // Normalize coordinates to (-1, 1) range
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Function to get 3D mouse position (call this from experiments)
export function getMouse3DPosition(camera, scene) {
    raycaster.setFromCamera(mousePosition, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        return intersects[0].point;
    }
    return null;
}

// Add OrbitControls for Pan, Zoom, and Orbit
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2; // Restrict vertical movement


/*
// Function to Load and Apply an Experiment
async function loadExperiment(experimentName) {
    console.log(`Loading Experiment: ${experimentName}`);
    try {
        const module = await import(`./modules/${experimentName}.js`);
        module.init(scene, camera, renderer);
    } catch (error) {
        console.error(`Error loading ${experimentName}:`, error);
    }
}

// Dynamically Load an Experiment (Change this name to test different ones)
loadExperiment("experiment1");
*/

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Load Textures for Background Plane and Model
const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load("assets/squirrel.jpg");
const modelTexture = textureLoader.load("assets/squirrel.jpg"); // Ensure this texture exists

// Function to Load a Model
function loadModel(file) {
    console.log("Uploading file:", file.name);
    const extension = file.name.split('.').pop().toLowerCase();
    const url = URL.createObjectURL(file);

    let loader;
    if (extension === "glb" || extension === "gltf") {
        loader = new GLTFLoader();
        loader.load(url, (gltf) => addModelToScene(gltf.scene));
    } else if (extension === "obj") {
        loader = new OBJLoader();
        loader.load(url, (obj) => addModelToScene(obj));
    } else if (extension === "fbx") {
        loader = new FBXLoader();
        loader.load(url, (fbx) => addModelToScene(fbx));
    } else {
        alert("Unsupported file format! Please upload a GLB, GLTF, OBJ, or FBX file.");
        console.error("Unsupported format:", extension);
    }
}

// Function to Add Model to Scene
function addModelToScene(model) {
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
    scene.add(model);
    console.log("Model added:", model);

        // Extract vertex data
        model.traverse((child) => {
            if (child.isMesh) {
                const geometry = child.geometry;
                if (geometry.isBufferGeometry) {
                    const positions = geometry.attributes.position.array;
                    console.log("Vertex Positions:", positions); // Log raw vertex data
                    displayVertexData(positions); // Display in UI
                }
            }
        });

    // Center the model in the scene
    const bbox = new THREE.Box3().setFromObject(model);
    const center = bbox.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Apply Custom Shader and Texture to Model
    Promise.all([
        loadShader("shaders/vertexShader.glsl"),
        loadShader("shaders/fragmentShader.glsl"),
    ]).then(([vertexShader, fragmentShader]) => {
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: modelTexture },
                time: { value: 0.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        model.traverse((child) => {
            if (child.isMesh) {
                child.material = shaderMaterial;
            }
        });
    });
}

// Handle File Upload
const fileInput = document.getElementById("fileInput");
if (fileInput) {
    fileInput.addEventListener("change", function (event) {
        if (event.target.files.length > 0) {
            loadModel(event.target.files[0]);
        }
    });
}

// Load Shaders
async function loadShader(url) {
    const response = await fetch(url);
    return await response.text();
}

// Create Background Shader Plane
Promise.all([
    loadShader("shaders/vertexShader.glsl"),
    loadShader("shaders/fragmentShader.glsl"),
]).then(([vertexShader, fragmentShader]) => {
    const backgroundMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: backgroundTexture },
            time: { value: 0.0 },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), backgroundMaterial);
    scene.add(plane);

    function animate() {
        requestAnimationFrame(animate);
        backgroundMaterial.uniforms.time.value += 0.01;
        controls.update(); // Update OrbitControls each frame
        renderer.render(scene, camera);
    }
    animate();
});


// convert and format vertex data for display
function displayVertexData(vertexArray) {
    const vertexDisplay = document.getElementById("vertexDataDisplay");
    if (!vertexDisplay) return;

    let textOutput = "Vertex Positions:\n";
    for (let i = 0; i < vertexArray.length; i += 3) {
        textOutput += `X: ${vertexArray[i].toFixed(3)}, Y: ${vertexArray[i + 1].toFixed(3)}, Z: ${vertexArray[i + 2].toFixed(3)}\n`;
        if (i > 300) break; // Limit output to avoid freezing the page
    }

    vertexDisplay.textContent = textOutput; // Update UI
}

// Main Animation Loop
function animateScene() {
    requestAnimationFrame(animateScene);
    controls.update(); // Ensure controls are updated
    renderer.render(scene, camera);
}
animateScene();