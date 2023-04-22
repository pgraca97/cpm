import * as THREE from './libraries/three';
import * as CANNON from './libraries/cannon-es';
import * as TWEEN from './libraries/@tweenjs/tween.js'
import { DragControls } from './libraries/three/examples/jsm/controls/DragControls.js';
import { FontLoader } from './libraries/three/examples/jsm/controls/DragControls.js';
import { TextGeometry } from './libraries/three/examples/jsm/geometries/TextGeometry.js';



let planets = []
// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);

camera.position.set(0, 0, 100);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up Cannon.js
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, 0, 0),
});
const clock = new THREE.Clock();

world.defaultContactMaterial.contactEquationStiffness = 10e9;
world.defaultContactMaterial.contactEquationRelaxation = 0.2;
function createStarryBackground(width, height, frames = 30) {
  const textures = [];
  for (let frame = 0; frame < frames; frame++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    // Create a radial gradient.
    const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
    gradient.addColorStop(0, 'rgb(15, 10, 40)');
    gradient.addColorStop(1, 'rgb(0, 0, 10)');

    // Set the gradient as the background.
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Draw stars.
    const stars = 1000;
    for (let i = 0; i < stars; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      const opacity = Math.random() * 0.7 + 0.3;
      context.fillStyle = `rgba(255, 255, 255, ${opacity})`; // Removed the multiplication with the frame index
      context.fillRect(x, y, size, size);
    }

    textures.push(new THREE.CanvasTexture(canvas));
  }

  return textures;
}


class AnimatedTextureMaterial extends THREE.MeshBasicMaterial {
  constructor({ textures, speed = 0.1, fadeInTime = 1, ...options }) {
    super(options);
    this.textures = textures;
    this.speed = speed;
    this.fadeInTime = fadeInTime;
    this.currentFrame = 0;
    this.map = textures[0];
    this.transparent = true;
    this.opacity = 0;
    
    // Initialize fade-in animation
    this.initFadeIn();
  }

  initFadeIn() {
    const fadeInTween = new TWEEN.Tween(this)
      .to({ opacity: 1 }, this.fadeInTime * 1000) // Convert fadeInTime to milliseconds
      .easing(TWEEN.Easing.Quadratic.In)
      .start();
  }

  update(delta) {
    this.currentFrame += this.speed * delta;
    
    if (this.currentFrame >= this.textures.length) {
      this.currentFrame = 0;
    }
    
    this.map = this.textures[Math.floor(this.currentFrame)];
  }
}

// ... your other code ...

const backgroundTextures = createStarryBackground(window.innerWidth, window.innerHeight);
const backgroundMaterial = new AnimatedTextureMaterial({
  textures: backgroundTextures,
  speed: 10,
  fadeInTime: 0.5, // The initial fade-in time in seconds, adjust as needed
});

const aspect = window.innerWidth / window.innerHeight;
const verticalFov = camera.fov * Math.PI / 180;
const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);

const distance = camera.position.z;
const planeHeight = 2 * Math.tan(verticalFov / 2) * distance;
const planeWidth = 2 * Math.tan(horizontalFov / 2) * distance;

const backgroundPlane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(planeWidth, planeHeight),
  backgroundMaterial
);
backgroundPlane.position.set(0, 0, -100);
camera.add(backgroundPlane);
scene.add(camera);


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 200);
scene.add(light);


// Add this near the beginning of your script
const fontLoader = new FontLoader();

// In the init function or wherever you're creating your scene objects
fontLoader.load('assets/helvetiker_regular.typeface.json', function (font) {
  const text = createText('Space Odyssey VR', new THREE.Vector3(0, 15, 10), 0xCDCDCD, font);
  scene.add(text);
});

// Update the createText function to accept the font as an argument
function createText(text, position, color, font) {
  const material = new THREE.MeshBasicMaterial({ color });
  const geometry = new TextGeometry(text, {
    font: font,
    size: 10,
    height: 1.5 // Increase the height to give it more depth
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  // Remove the following line to fix the mirrored issue
  // mesh.rotation.y = Math.PI;
  return mesh;
}



let backgroundNoisePlaying = false;
function toggleSound() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (backgroundNoisePlaying) {
    stopSound();
    backgroundNoisePlaying = false;
  } else {
    playBackgroundSound();
    backgroundNoisePlaying = true;
  }
}

document.getElementById('toggleSound').addEventListener('click', () => {
  toggleSound();
});


const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};

async function loadAudio(url, name) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBuffers[name] = audioBuffer;
}


function stopSound() {
  if (movingSoundPlaying) {
    movingSoundSource.stop();
  }

  if (backgroundNoisePlaying) {
    backgroundNoiseSource.stop();
  }
}



let movingSoundPlaying = false;

let backgroundNoiseSource;

function playSound(name, volume = 0.1, loop = false) {
  if (name === 'moving' && movingSoundPlaying) {
    return;
  }

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  source.buffer = audioBuffers[name];
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  source.loop = loop;

  source.start(0);

  if (name === 'moving') {
    movingSoundPlaying = true;
    source.onended = () => {
      movingSoundPlaying = false;
    };
  }

  return source; // Return the source
}

async function playBackgroundSound() {
  await Promise.all([
    loadAudio('assets/sounds fx/background.mp3', 'background_noise'),
  ]);

  backgroundNoiseSource = playSound('background_noise', 0.2, true);
  backgroundNoisePlaying = true;
  console.log('playing background sound');
}


loadAudio('assets/sounds fx/mixkit-cinematic-laser-swoosh-1467.wav', 'dragging_small'),
loadAudio('assets/sounds fx/mixkit-cinematic-muddy-swoosh-1470.wav', 'dragging_medium'),
loadAudio('assets/sounds fx/mixkit-catapult-fire-whoosh-1344.wav', 'dragging_large'),
loadAudio('assets/sounds fx/no-evidence-of-disease-144022.mp3', 'moving'),
loadAudio('assets/sounds fx/tectonic-plates-collide-102429.mp3', 'collision')
// ...previous code...


playBackgroundSound();


function getDragSoundAndVolume(planet) {
  const planetSizes = [
    { name: "small", planets: ["Mercury", "Venus", "Earth", "Mars"] },
    { name: "medium", planets: ["Uranus", "Neptune"] },
    { name: "large", planets: ["Jupiter", "Saturn"] },
  ];
  const maxRadius = Math.max(...planets.map(planet => planet.radius));

  const size = planetSizes.find((size) => size.planets.includes(planet.name));

  if (size) {
    const volume = 0.1 * (planet.radius / maxRadius);

    return { sound: `dragging_${size.name}`, volume };
  }

  return { sound: "dragging", volume: 0.1 };
}

function playCollisionSound(planet1, planet2) {
  const volume1 = getVolumeForPlanet(planet1);
  const volume2 = getVolumeForPlanet(planet2);
  const volume = Math.max(volume1, volume2);

  playSound('collision', volume);
}

function getVolumeForPlanet(planet) {
  const planetVolumes = {
    "Mercury": 0.01,
    "Mars": 0.01,
    "Venus": 0.02,
    "Earth": 0.02,
    "Neptune": 0.03,
    "Uranus": 0.03,
    "Jupiter": 0.04,
    "Saturn": 0.04,
    "Sun": 0.05,
  };

  return planetVolumes[planet.name] || 0.01;
}

function createPlanet(name, radius, mass, position, color) {
  const shape = new CANNON.Sphere(radius);
  const materialBody = new CANNON.Material(); // Add this line to create a material for each body
  const body = new CANNON.Body({ mass: mass, material: materialBody, collisionResponse: true }); // Add collisionResponse property

  body.addShape(shape, new CANNON.Vec3());
  body.position.copy(position);
  world.addBody(body);

  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.userData.sphere = shape; // Store the sphere object in userData
  scene.add(mesh);
  planets.push({name, mesh: mesh, body: body, radius})
  return { name, shape, body, mesh, radius };
}

const sun = createPlanet("Sun", 109, 1989000, new THREE.Vector3(-125, 0, -10), 0xffff00);
const mercury = createPlanet("Mercury", 0.383, 0.055, new THREE.Vector3(-15.5, 0, 0), '#A9A9A9');
const venus = createPlanet("Venus", 0.72, 0.815, new THREE.Vector3(-13.2, 0, 0), 0xffa500);
const earth = createPlanet("Earth", 1, 1, new THREE.Vector3(-10.4, 0, 0), 'blue');
const mars = createPlanet("Mars", 0.532, 0.107, new THREE.Vector3(-7, 0, 0), 'red');
const jupiter = createPlanet("Jupiter", 11.21, 317.8, new THREE.Vector3(7, 0, 0), 'orange');
const saturn = createPlanet("Saturn", 9.45, 95.2, new THREE.Vector3(30, 0, 0), 'pink');
const uranus = createPlanet("Uranus", 4.01, 14.6, new THREE.Vector3(45.8, 0, 0), 'green');
const neptune = createPlanet("Neptune", 3.88, 17.2, new THREE.Vector3(55.9, 0, 0), 'orange');

function createPlanetContactMaterial(planet) {
  const options = {
    friction: 0.5,
    restitution: 0.5,
    contactEquationStiffness: 10e9 * planet.body.mass,
    contactEquationRelaxation: 1,
    frictionEquationStiffness: 10e9 * planet.body.mass,
    frictionEquationRelaxation: 1,
  };

  const contactMaterial = new CANNON.ContactMaterial(planet.body.material, planet.body.material, options);
  world.addContactMaterial(contactMaterial);
}

planets.forEach(createPlanetContactMaterial);


let isDragging = false;

const transformGroup = new THREE.Group();
planets.forEach((planet) => {
  transformGroup.add(planet.mesh);
});
scene.add(transformGroup);

const dragControls = new DragControls(planets.filter(planet => planet.mesh !== sun.mesh).map(planet => planet.mesh), camera, renderer.domElement);

dragControls.enabled = false;


dragControls.addEventListener("dragstart", (event) => {
  console.log("dragstart event triggered with object:", event.object);

    const planet = planets.find((p) => p.mesh === event.object);
    planet.savedMass = planet.body.mass; // Save the original mass
    planet.body.mass = 0; // Set the mass to 0 while dragging
    planet.body.updateMassProperties(); // Update mass properties

    
    objectsBeingMoved.add(planet.body);
    pauseLevitating = true;
    
  }
);

dragControls.addEventListener("dragend", (event) => {
  const planet = planets.find((p) => p.mesh === event.object);
  planet.body.mass = planet.savedMass; // Restore the original mass
  planet.body.updateMassProperties(); // Update mass properties
  objectsBeingMoved.delete(planet.body);

  // Set the planet's final Y position
  planet.body.position.y = planet.mesh.position.y;
  isDragging = false;
  moveSpheresToTargetPositions(5000, 2000, true);
});


dragControls.addEventListener("drag", (event) => {
  const planet = planets.find((planet) => planet.mesh === event.object);
  const { sound, volume } = getDragSoundAndVolume(planet);
  playSound(sound, volume);
  const sunPosition = sun.mesh.position;
  const planetPosition = event.object.position;

  // Calculate the distance between the planet and the sun
  const distanceToSun = planetPosition.distanceTo(sunPosition);

  // Define a constant minimum distance for all planets from the sun
  const minDistanceFromSun = sun.shape.radius + event.object.geometry.boundingSphere.radius ;

  // Check if the distance is greater than the constant minimum distance
  if (distanceToSun > minDistanceFromSun) {
    planet.body.position.copy(event.object.position); // Change 'body' to 'planet.body'
  } else {
    // Calculate the direction vector from the sun to the planet
    const direction = planetPosition.clone().sub(sunPosition).normalize();

    // Set the planet's position on the sun's circumference
    const newPosition = sunPosition.clone().add(direction.multiplyScalar(minDistanceFromSun));
    event.object.position.copy(newPosition);
    planet.body.position.copy(newPosition); // Change 'body' to 'planet.body'
  }
  dragControls.activate();
});

// Create a Map to store the original positions of collided spheres
const collidedPlanetsOriginalPositions = new Map();

let draggingSun = false;

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1;

renderer.domElement.addEventListener('mousedown', (event) => {
  event.preventDefault();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(planets.map(planet => planet.mesh));

  if (intersects.length > 0 && !isDragging) {
    if (intersects[0].object === sun.mesh) {
      alert('Oh, I am too heavy! You are not able to drag me!');
      draggingSun = true;
    } else {
      draggingSun = false;
    }
  }
});

let pauseLevitating = false;

const objectsBeingMoved = new Set();

function moveBody(mesh, body, targetX, duration) {
  objectsBeingMoved.add(body); // Add the object to the Set

  const tween = new TWEEN.Tween({ x: body.position.x })
    .to({ x: targetX }, duration)
    .easing(TWEEN.Easing.Quadratic.InOut) // easing function for smoother animation
    .onUpdate((coords) => {

      body.position.x = coords.x;
      mesh.position.x = coords.x;
      world.addEventListener("postStep", () => {
        sun.body.position.set(-150, 0, 0); // Force the sun to remain in position
        sun.mesh.position.set(-150, 0, 0);
        sun.body.velocity.set(0, 0, 0); // Force the sun to remain
      });
      mesh.userData.targetX = targetX; // Store the target x position
    })
    .onComplete(() => {
      objectsBeingMoved.delete(body); // Remove the object from the Set

      if (!dragControls.enabled) {
        dragControls.enabled = true;
      }
      const durationY = 1000; // set the duration for the y movement

      new TWEEN.Tween({ y: body.position.y })
        .to({ y: body.position.y + 1 }, durationY)
        .easing(TWEEN.Easing.Quadratic.InOut) // easing function for smoother animation
        .onUpdate((coords) => {
          if (!pauseLevitating) {
            const yOffset = 0.2 * Math.sin(Date.now() / 1000); // calculate the vertical offset based on a sine wave
            body.position.y = yOffset + coords.y;
            mesh.position.y = yOffset + coords.y; // Update the mesh position as well
          }
        })
        .repeat(Infinity) // repeat the animation infinitely
        .yoyo(true) // reverse the animation back and forth
        .start(); // start the y movement tween

        
    });

  tween.start();
}

function moveBackToPlace(planet, originalPosition, duration) {
  if (!collidedPlanetsOriginalPositions.has(planet)) {
    collidedPlanetsOriginalPositions.set(planet, originalPosition);
  }

  new TWEEN.Tween(planet.mesh.position)
    .to({ x: originalPosition.x, y: originalPosition.y }, duration)
    .easing(TWEEN.Easing.Quadratic.Out) // Use easing for smoother animation

    .onUpdate((coords) => {
      playSound("moving", 0.01);
      planet.mesh.position.x = coords.x;
      planet.body.position.x = coords.x;
      planet.mesh.position.y = coords.y;
      planet.body.position.y = coords.y;
    })
    .onComplete(() => {
      collidedPlanetsOriginalPositions.delete(planet);

      planet.body.velocity.set(0, 0, 0); // Reset the sphere's velocity
    })
    .start();
}

function moveSpheresToTargetPositions(delay, duration, afterDragend = false) {
  setTimeout(() => {
    planets.forEach((planet) => {
      const targetX = planet.mesh.userData.targetX;
      if (planet.mesh.position.x !== targetX && !objectsBeingMoved.has(planet.body)) {
        moveBackToPlace(planet, { x: targetX, y: 0 }, duration);
      }
    });

    // If the function was called after a dragend event, call it again
    if (afterDragend) {
      moveSpheresToTargetPositions(7000, 2000, false);
    }
  }, delay);
}

const sunRightExtremity = -150 + 109;

// Set the scaling factor to 6.2
const scalingFactor = 6.2;

moveBody(sun.mesh, sun.body, -150, 5000);
moveBody(mercury.mesh, mercury.body, sunRightExtremity + 0.4 * scalingFactor, 5000);
moveBody(venus.mesh, venus.body, sunRightExtremity + 0.7 * scalingFactor, 5000);
moveBody(earth.mesh, earth.body, sunRightExtremity + 1 * scalingFactor, 5000);
moveBody(mars.mesh, mars.body, sunRightExtremity + 1.5 * scalingFactor, 5000);
moveBody(jupiter.mesh, jupiter.body, sunRightExtremity + 5.2 * scalingFactor, 5000);
moveBody(saturn.mesh, saturn.body, sunRightExtremity + 9.6 * scalingFactor, 5000);
moveBody(uranus.mesh, uranus.body, sunRightExtremity + 19.2 * scalingFactor, 5000);
moveBody(neptune.mesh, neptune.body, sunRightExtremity + 30.1 * scalingFactor, 5000);

function updateMeshPositions() {
  planets.forEach((planet) => {
    if (!objectsBeingMoved.has(planet.body)) { // Check if the object is not being moved
      planet.mesh.position.copy(planet.body.position);
      planet.mesh.quaternion.copy(planet.body.quaternion);
    }
  });

}

function checkAllSpheresInFinalPositions() {
  let allSpheresInFinalPositions = true;

  for (const planet of planets) {
    if (planet.body.position.x !== planet.mesh.userData.targetX) {
      allSpheresInFinalPositions = false;
      break;
    }
  }

  if (!movingSoundPlaying && !allSpheresInFinalPositions) {
    playSound("moving", 0.01);
  } else if (movingSoundPlaying && allSpheresInFinalPositions) {
    movingSoundPlaying = false;
  }
}

world.addEventListener("postStep", () => {
  for (let i = 0; i < planets.length - 1; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];

      const distance = planet1.mesh.position.distanceTo(planet2.mesh.position);
      const minDistance = planet1.radius + planet2.radius;

      if (distance <= minDistance) {
        playCollisionSound(planet1, planet2);
      }
    }
  }
});

function render(t) {
  requestAnimationFrame(render);
  const delta = clock.getDelta();
  backgroundMaterial.update(delta);
  // Update physics
  world.step(1 / 60);

  // Synchronize Three.js meshes with Cannon.js bodies
  updateMeshPositions();
  checkAllSpheresInFinalPositions();
  // Render the scene
  TWEEN.update(t);
  renderer.render(scene, camera);
}
// Start the render loop
render();

