varying vec2 vUv;
uniform sampler2D uTexture;
uniform float time;

void main() {
    vec4 color = texture2D(uTexture, vUv);
    float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Displace UV coordinates based on brightness
    vec2 distortion = vec2(sin(time * 2.0 + brightness * 10.0) * 0.01, 0.0);
    
    gl_FragColor = texture2D(uTexture, vUv + distortion);
}

