(function() {

function addStars(sceneContainer, stars) {
  for (let i = 0; i < stars; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDuration = `${Math.random() * 3 + 1}s`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    sceneContainer.appendChild(star);
  }

  // Add smaller stars
  for (let i = 0; i < stars; i++) {
    const star = document.createElement("div");
    star.className = "star-small";
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDuration = `${Math.random() * 3 + 1}s`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    sceneContainer.appendChild(star);
  }
}

let t = 0;
const speed = 0.001;

function parallaxStars(sceneContainer, stars) {
  t += speed;

  stars.forEach((star, index) => {
    const offset = index % 2 === 0 ? 5 : 10;
    const newX = Math.sin(t) * offset;
    const newY = Math.cos(t) * offset;

    star.style.transform = `translate(${newX}px, ${newY}px)`;
  });
}

function animateParallaxStars(sceneContainer, stars) {
  parallaxStars(sceneContainer, stars);
  requestAnimationFrame(() => animateParallaxStars(sceneContainer, stars));
}

document.addEventListener("DOMContentLoaded", () => {
  const sceneContainer = document.querySelector("#scene-container");
  addStars(sceneContainer, 1000);

  const stars = document.querySelectorAll(".star, .star-small");
  animateParallaxStars(sceneContainer, stars);
});
AFRAME.registerComponent("star", {
  init: function () {
    const star = document.createElement("a-sphere");
    star.setAttribute("radius", Math.random() * 0.01 + 0.002);
    star.setAttribute(
      "position",
      `${Math.random() * 100 - 50} ${Math.random() * 100 - 50} ${
        Math.random() * -50 - 5
      }`
    );
    star.setAttribute(
      "material",
      "color: #fff; emissive: #fff; emissiveIntensity: 0.7; opacity: 0.7; transparent: true;"
    );

    const opacityAnimation = document.createElement("a-animation");
    opacityAnimation.setAttribute("attribute", "material.opacity");
    opacityAnimation.setAttribute("from", "0.2");
    opacityAnimation.setAttribute("to", "1");
    opacityAnimation.setAttribute("direction", "alternate");
    opacityAnimation.setAttribute("dur", `${Math.random() * 3000 + 1000}`);
    opacityAnimation.setAttribute("repeat", "indefinite");

    star.appendChild(opacityAnimation);
    this.el.appendChild(star);
  },
});

function addStarEntities(scene, numStars) {
  for (let i = 0; i < numStars; i++) {
    const starEntity = document.createElement("a-entity");
    starEntity.setAttribute("star", "");
    scene.appendChild(starEntity);
  }
}

AFRAME.registerComponent('orbit', {
  schema: {
    radius: { type: 'number', default: 10 },
    period: { type: 'number', default: 1 }
  },

  init: function() {
    this.theta = 0;
  },

  tick: function(time, timeDelta) {
    this.theta -= (2 * Math.PI / this.data.period) * (timeDelta / 1000);

    const x = this.data.radius * Math.cos(this.theta);
    const z = this.data.radius * Math.sin(this.theta);

    this.el.setAttribute('position', { x: x, y: 0, z: z });
  }
});

// Set the update interval for the A-Frame tick function to 1000/60 milliseconds
AFRAME.utils.throttleTick(AFRAME.components.orbit.tick, 1000 / 60, AFRAME.components.orbit);



})(); // End of the IIFE


document.addEventListener("DOMContentLoaded", function () {
  const distanceBtn = document.getElementById("distance");
  const sizeBtn = document.getElementById("size");
  const speedBtn = document.getElementById("speed");

  // Realistic distance scaling
  const distanceScale = [
    {
      property: "position",
      values: {
        sun: { x: 0, y: 0, z: 0 },
        mercury: { x: 6, y: 0, z: 0 },
        venus: { x: 10.5, y: 0, z: 0 },
        earth: { x: 15, y: 0, z: 0 },
        mars: { x: 22.5, y: 0, z: 0 },
        jupiter: { x: 75, y: 0, z: 0 },
        saturn: { x: 135, y: 0, z: 0 },
        uranus: { x: 270, y: 0, z: 0 },
        neptune: { x: 420, y: 0, z: 0 },
      },
    },
    {
      property: "spheresRadius",
      values: {
        sun: 5,
        mercury: 1,
        venus: 2,
        earth: 2,
        mars: 2,
        jupiter: 4,
        saturn: 3,
        uranus: 2.5,
        neptune: 2.5,
      },
    },
    {
      property: "orbits",
      values: {
        mercury: { radiusInner: 6, radiusOuter: 6.1, position: { x: 0, y: 0, z: 0 } },
        venus: { radiusInner: 10.5, radiusOuter: 10.6, position: { x: 0, y: 0, z: 0 } },
        earth: { radiusInner: 15, radiusOuter: 15.1, position: { x: 0, y: 0, z: 0 } },
        mars: { radiusInner: 22.5, radiusOuter: 22.6, position: { x: 0, y: 0, z: 0 } },
        jupiter: { radiusInner: 75, radiusOuter: 75.1, position: { x: 0, y: 0, z: 0 } },
        saturn: { radiusInner: 135, radiusOuter: 135.1, position: { x: 0, y: 0, z: 0 } },
        uranus: { radiusInner: 270, radiusOuter: 270.1, position: { x: 0, y: 0, z: 0 } },
        neptune: { radiusInner: 420, radiusOuter: 420.1, position: { x: 0, y: 0, z: 0 } },
      },
    },
    
    {
      property: "orbit",
      values: {
        mercury: { radius: 6, period: 8 },
        venus: { radius: 10.5, period: 225 },
        earth: { radius: 15, period: 365 },
        mars: { radius: 22.5, period: 687 },
        jupiter: { radius: 75, period: 4300 },
        saturn: { radius: 135, period: 10750 },
        uranus: { radius: 270, period: 30600 },
        neptune: { radius: 420, period: 60225 },
      },
    },
    {
      property: "camera",
      values: {
        mainCamera: { y: 200 },
      },
    },
  ];
  

  const sizeScale = [
    {
      property: "position",
      values: {
        sun: { x: 0, y: 0, z: 0 },
        mercury: { x: 6, y: 0, z: 0 },
        venus: { x: 10.5, y: 0, z: 0 },
        earth: { x: 15, y: 0, z: 0 },
        mars: { x: 22.5, y: 0, z: 0 },
        jupiter: { x: 75, y: 0, z: 0 },
        saturn: { x: 135, y: 0, z: 0 },
        uranus: { x: 270, y: 0, z: 0 },
        neptune: { x: 420, y: 0, z: 0 },
      },
    },
    {
      property: "spheresRadius",
      values: {
        sun: 5,
        mercury: 0.6,
        venus: 0.8,
        earth: 1,
        mars: 0.8,
        jupiter: 4,
        saturn: 3,
        uranus: 2,
        neptune: 2,
      },
    },
    {
      property: "orbits",
      values: {
        mercury: { radiusInner: 6, radiusOuter: 6.1 },
        venus: { radiusInner: 10.5, radiusOuter: 10.6 },
        earth: { radiusInner: 15, radiusOuter: 15.1 },
        mars: { radiusInner: 22.5, radiusOuter: 22.6 },
        jupiter: { radiusInner: 75, radiusOuter: 75.1 },
        saturn: { radiusInner: 135, radiusOuter: 135.1 },
        uranus: { radiusInner: 270, radiusOuter: 270.1 },
        neptune: { radiusInner: 420, radiusOuter: 420.1 },
      },
    },
    {
      property: "orbit",
      values: {
        mercury: { radius: 6, period: 88 },
        venus: { radius: 10.5, period: 225 },
        earth: { radius: 15, period: 365 },
        mars: { radius: 22.5, period: 687 },
        jupiter: { radius: 75, period: 4300 },
        saturn: { radius: 135, period: 10750 },
        uranus: { radius: 270, period: 30600 },
        neptune: { radius: 420, period: 60225 },
      },
    },
    {
      property: "camera",
      values: {
        mainCamera: { y: 20 },
      },
    },
  ];
  
  const speedScale = [
    {
      property: "position",
      values: {
        sun: { x: 0, y: 0, z: 0 },
        mercury: { x: 3, y: 0, z: 0 },
        venus: { x: 5.5, y: 0, z: 0 },
        earth: { x: 8, y: 0, z: 0 },
        mars: { x: 12, y: 0, z: 0 },
        jupiter: { x: 40, y: 0, z: 0 },
        saturn: { x: 72, y: 0, z: 0 },
        uranus: { x: 145, y: 0, z: 0 },
        neptune: { x: 225, y: 0, z: 0 },
      },
    },
    {
      property: "spheresRadius",
      values: {
        sun: 5,
        mercury: 1,
        venus: 2,
        earth: 2,
        mars: 2,
        jupiter: 4,
        saturn: 3,
        uranus: 2.5,
        neptune: 2.5,
      },
    },
    {
      property: "orbits",
      values: {
        mercury: { radiusInner: 6, radiusOuter: 6.1 },
        venus: { radiusInner: 10.5, radiusOuter: 10.6 },
        earth: { radiusInner: 15, radiusOuter: 15.1 },
        mars: { radiusInner: 22.5, radiusOuter: 22.6 },
        jupiter: { radiusInner: 75, radiusOuter: 75.1 },
        saturn: { radiusInner: 135, radiusOuter: 135.1 },
        uranus: { radiusInner: 270, radiusOuter: 270.1 },
        neptune: { radiusInner: 420, radiusOuter: 420.1 },
      },
    },
    {
      property: "orbit",
      values: {
        mercury: { radius: 6, period: 2 },
        venus: { radius: 10.5, period: 5 },
        earth: { radius: 15, period: 8 },
        mars: { radius: 22.5, period: 10 },
        jupiter: { radius: 75, period: 9 },
        saturn: { radius: 135, period: 2 },
        uranus: { radius: 270, period: 10 },
        neptune: { radius: 420, period: 10 },
      },
    },
    {
      property: "camera",
      values: {
        mainCamera: { y: 200 },
      },
    },
  ];
  
  

  function animateCameraPosition(z) {
    const camera = document.querySelector("a-entity[camera]");
    const currentPosition = camera.getAttribute("position");
    const newPosition = { x: currentPosition.x, y: z, z: currentPosition.z };
  
    camera.setAttribute("animation", {
      property: "position",
      to: newPosition,
      dur: 1000,
      easing: "easeInOutQuad",
    });
  }
  
  distanceBtn.addEventListener("click", () => {
    applyScale(distanceScale);
    showModal("Distances from the Sun", [
      { name: "Mercury", value: "57.9 million km" },
      { name: "Venus", value: "108.2 million km" },
      { name: "Earth", value: "149.6 million km" },
      { name: "Mars", value: "227.9 million km" },
      { name: "Jupiter", value: "778.5 million km" },
      { name: "Saturn", value: "1.4 billion km" },
      { name: "Uranus", value: "2.9 billion km" },
      { name: "Neptune", value: "4.5 billion km" },
    ]);
  });
  
  sizeBtn.addEventListener("click", () => {
    applyScale(sizeScale);
    showModal("Equatorial Circumference", [
      { name: "Sun", value: "4,379,000 km" },
      { name: "Mercury", value: "15,329 km" },
      { name: "Venus", value: "38,025 km" },
      { name: "Earth", value: "40,075 km" },
      { name: "Mars", value: "21,297 km" },
      { name: "Jupiter", value: "439,264 km" },
      { name: "Saturn", value: "365,882 km" },
      { name: "Uranus", value: "160,591 km" },
      { name: "Neptune", value: "154,948 km" },
    ]);
  });
  
  speedBtn.addEventListener("click", () => {
    applyScale(speedScale);
    showModal("Orbital Period and Speed", [
      { name: "Mercury", value: "88 Earth days, 47.87 km/s" },
      { name: "Venus", value: "224.7 Earth days, 35.02 km/s" },
      { name: "Earth", value: "365.2 Earth days, 29.78 km/s" },
      { name: "Mars", value: "687 Earth days, 24.08 km/s" },
      { name: "Jupiter", value: "4,331 Earth days, 13.07 km/s" },
      { name: "Saturn", value: "10,759 Earth days, 9.69 km/s" },
      { name: "Uranus", value: "30,688 Earth days, 6.81 km/s" },
      { name: "Neptune", value: "60,190 Earth days, 5.43 km/s" },
    ]);
  });
  

  function showModal(title, items) {
    const modal = document.getElementById("info-modal");
  
    if (modal.style.display === "block") {
      document.getElementById("modal-title").innerText = title;
  
      const list = document.getElementById("modal-info");
      list.innerHTML = "";
      items.forEach((item) => {
        const li = document.createElement("li");
        li.innerText = `${item.name}: ${item.value}`;
        list.appendChild(li);
      });
    } else {
      document.getElementById("modal-title").innerText = title;
  
      const list = document.getElementById("modal-info");
      list.innerHTML = "";
      items.forEach((item) => {
        const li = document.createElement("li");
        li.innerText = `${item.name}: ${item.value}`;
        list.appendChild(li);
      });
  
      modal.style.display = "block";
  
      const closeBtn = document.querySelector(".close");
      closeBtn.onclick = () => {
        modal.style.display = "none";
      };
  
      window.onclick = (event) => {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      };
    }
  }
  

  function applyScale(scaleArray) {
    scaleArray.forEach((scaleObject) => {
      const property = scaleObject.property;
      const values = scaleObject.values;
  
      if (property === "orbits") {
        Object.keys(values).forEach((planetId) => {
          const orbitId = planetId + "-orbit";
          const entity = document.getElementById(orbitId);
          if (!entity) {
            console.error(`Entity with id '${orbitId}' not found`);
            return;
          }
          const ring = entity.querySelector("a-ring");
          ring.setAttribute("animation__radius-inner", {
            property: "radius-inner",
            to: values[planetId].radiusInner,
            dur: 2000,
          });
          ring.setAttribute("animation__radius-outer", {
            property: "radius-outer",
            to: values[planetId].radiusOuter,
            dur: 2000,
          });
  
          if (values[planetId].position) {
            entity.setAttribute("animation__position", {
              property: "position",
              to: `${values[planetId].position.x} ${values[planetId].position.y} ${values[planetId].position.z}`,
              dur: 2000,
            });
          }
        });
      } else {
        Object.keys(values).forEach((elementId) => {
          const entityValues = values[elementId];
          const entity = document.getElementById(elementId);
          if (!entity) {
            console.error(`Entity with id '${elementId}' not found`);
            return;
          }
  
          if (property === "position") {
            entity.setAttribute("animation__position", {
              property: "position",
              to: `${entityValues.x} ${entityValues.y} ${entityValues.z}`,
              dur: 2000,
            });
          } else if (property === "spheresRadius") {
            const sphere = entity.querySelector("a-sphere");
            sphere.setAttribute("animation__radius", {
              property: "radius",
              to: entityValues,
              dur: 2000,
            });
          } else if (property === "orbit") {
            const radius = entityValues.radius;
            const period = entityValues.period;
            const orbit = entity.getAttribute("orbit");
  
            entity.setAttribute("animation__radius", {
              property: "orbit.radius",
              from: orbit.radius,
              to: radius,
              dur: 2000,
            });
  
            entity.setAttribute("animation__period", {
              property: "orbit.period",
              from: orbit.period,
              to: period,
              dur: 2000,
            });
          } else if (property === "camera" && elementId === "mainCamera") {
            entity.setAttribute("animation__position", {
              property: "position",
              to: `0 ${entityValues.y} 0`,
              dur: 2000,
            });
          }
        });
      }
    });
  }
  
  
  

  applyScale(distanceScale)

  /*
  const music = document.querySelector('#music');
  const toggleSoundButton = document.querySelector('#toggle-sound');
  
  let soundOn = true;
  
  toggleSoundButton.addEventListener('click', () => {
    if (soundOn) {
      music.components.sound.stopSound();
      soundOn = false;
      toggleSoundButton.textContent = 'Sound On';
    } else {
      music.components.sound.playSound();
      soundOn = true;
      toggleSoundButton.textContent = 'Sound Off';
    }
  });
  */
  
});
  

AFRAME.registerComponent('zoom-controls', {
  init: function () {
    this.wheelDelta = 0;
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.updateCameraPosition = this.updateCameraPosition.bind(this);
  },
  
  play: function () {
    window.addEventListener('wheel', this.onMouseWheel);
    this.updateCameraPosition();
  },
  
  pause: function () {
    window.removeEventListener('wheel', this.onMouseWheel);
  },
  
  onMouseWheel: function (event) {
    event.preventDefault();
    this.wheelDelta += Math.sign(event.deltaY) * 0.005;
  },
  
  updateCameraPosition: function() {
    if (Math.abs(this.wheelDelta) > 0) {
      const camera = this.el.object3D;
      const direction = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1);
      const delta = this.wheelDelta;
      const newPosition = camera.position.clone().add(direction.multiplyScalar(delta));

      // Optional: Set limits for zooming in and out
      if (newPosition.length() >= 1 && newPosition.length() <= 200) {
        this.el.setAttribute('position', newPosition);
      }

      this.wheelDelta = 0;
    }

    requestAnimationFrame(this.updateCameraPosition);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  let toggleViewButton = document.getElementById('toggle-view');
  let mainCamera = document.getElementById('mainCamera');
  let scene = document.querySelector('a-scene');
  let isTopView = true;

  toggleViewButton.addEventListener('click', function () {
    if (isTopView) {
      mainCamera.setAttribute('animation', 'property: position; to: 10 11.6 15; dur: 1000; easing: easeInOutQuad');
      mainCamera.setAttribute('animation__rotation', 'property: rotation; to: 0 0 0; dur: 1000; easing: easeInOutQuad');
      mainCamera.setAttribute('look-controls', '');
      mainCamera.setAttribute('zoom-controls', '');
      scene.setAttribute('vr-mode-ui', 'enabled', true);
      toggleViewButton.innerText = 'Study Mode';
    } else {
      mainCamera.setAttribute('animation', 'property: position; to: 0 200 0; dur: 1000; easing: easeInOutQuad');
      mainCamera.setAttribute('animation__rotation', 'property: rotation; to: -90 0 0; dur: 1000; easing: easeInOutQuad');
      mainCamera.removeAttribute('look-controls');
      mainCamera.removeAttribute('zoom-controls');
      scene.setAttribute('vr-mode-ui', 'enabled', false);
      toggleViewButton.innerText = 'Exploration Mode';
    }
    isTopView = !isTopView;
  });
});
