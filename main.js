var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x1e2024);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var planeGeometry = new THREE.PlaneGeometry(9.45, 6.3);

var video = document.createElement('video');
var videoTexture = new THREE.VideoTexture(video);
video.src = "https://assets.codepen.io/1037366/Old+lady.mp4";

video.crossOrigin = "anonymous";
video.muted = 'muted';
video.preload = "auto";

var material = new THREE.ShaderMaterial({
    uniforms: {
        u_lightPos: {value: new THREE.Vector3(0, 0, 10)},
        u_texture: {value: videoTexture}
    },
    vertexShader: `
        varying vec3
        v_normal;
        varying vec3 v_position;
        varying vec2 v_uv;
        
        void main() {
            v_normal = normalMatrix * normal;
            v_position = vec3(modelMatrix * vec4(position, 1.0));
            v_uv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D u_texture;
        varying vec2 v_uv;
        varying vec3 v_normal;
        varying vec3 v_position;
        uniform vec3 u_lightPos;

        void main() {
            vec3 normal = normalize(v_normal);
            vec3 lightDir = normalize(u_lightPos - v_position);
            float diffuse = max(dot(lightDir, normal), 0.0);
            gl_FragColor = texture2D(u_texture, v_uv) * diffuse;
        }
    `
});

var plane = new THREE.Mesh(planeGeometry, material);

scene.add(plane);

var pointLight = new THREE.PointLight(0xff0000, 1, 100);
pointLight.position.set(0, 0, 60);
scene.add(pointLight);

camera.position.z = 7;

var playButton = document.createElement("button");
document.body.appendChild(playButton);

var tl = new gsap.timeline();
function playVideo(){
  video.play();
  if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
    video.muted = 'muted';
    } else {
      video.muted = false;
  }
}

playButton.addEventListener("click", function() {
    tl.set('body',{background:'transparent'});
    tl.to('button',1,{opacity:0});
    tl.to('.lady',1,{opacity:0},"-0.5");
    tl.to('canvas',1,{opacity:1},"-0.5");
    tl.call(playVideo);
});

video.addEventListener("ended", function() {
    video.currentTime = 0;
    video.pause();
    video.muted = 'muted';
    tl.set('body',{background:'#1e2024'});
    tl.to('canvas',1,{opacity:0});
    tl.to('.lady',1,{opacity:1},"-0.5");
    tl.to('button',1,{opacity:1});
});

document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event) {
    var x = (event.clientX / window.innerWidth) * 2 - 1;
    var y = -(event.clientY / window.innerHeight) * 2 + 1;

    plane.position.x = x;
    plane.position.y = y;
    plane.position.z = x * y;
    plane.rotation.x = x * 0.2;
    plane.rotation.y = y * 0.2;
}

window.onresize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
