varying vec2 vUv;

void main() {
    vUv = uv + vec2(sin(position.y * 10.0) * 0.01, 0.0); // Introduce wave distortion
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}