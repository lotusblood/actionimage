import * as THREE from "../node_modules/three/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.128/examples/jsm/loaders/GLTFLoader.js";

// Model Upload
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        loadModel(url);
    }
});

function loadModel(url) {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
        const model = gltf.scene;
        scene.add(model);
    });
}
