import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as core from "@theatre/core";
import State from "./BMW.theatre-project-stateANIMATION.json";
import { FontLoader } from "./loaders/FontLoader.js";
import { TextGeometry } from "./geometries/TextGeometry.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";
// import studio from "@theatre/studio";
import { LoadingManager } from "three";
// studio.initialize();

const projTHEATER = core.getProject("BMW", { state: State });
const toggle = document.getElementById("hero_toggle");
const ui = document.getElementById("ui");
ui.innerHTML = `
    <label class="label"
        ><input type="radio" name="color_car" value="#000000"
      /></label>
      <!-- Black Sapphire Metallic -->
      <label class="label"
        ><input type="radio" name="color_car" value="#63666A"
      /></label>
      <!-- Skyscraper Grey Metallic -->
      <label class="label"
        ><input type="radio" name="color_car" value="#181818"
      /></label>
      <!-- Dravit Grey -->
      <label class="label"
        ><input type="radio" name="color_car" value="#4b0000"
      /></label>
      <!-- Tanzanite Blue -->
      <label class="label"
        ><input type="radio" name="color_car" value="#121212"
      /></label>
      <!-- Frozen Black Metallic -->
      <label class="label"
        ><input type="radio" name="color_car" value="#00290f"
      /></label>
      <!-- British Racing Green -->
      <label class="label"
        ><input type="radio" name="color_car" value="#520017"
      /></label>
      <!-- Wildberry Metallic -->
      <label class="label"
        ><input type="radio" name="color_car" value="#00002c"
      /></label>
      <!-- Midnight Blue -->
      <label class="label"
        ><input type="radio" name="color_car" value="#887a00"
      /></label>
      <!-- Dark Olive Green -->
    `;
document.querySelectorAll(".label").forEach((co) => {
  co.style.background = co.querySelector("input").value;
});
const sheet = projTHEATER.sheet("car");
function lockLandscape() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().then(() => {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(console.warn);
      }
    });
  }
}

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xc8d0d0, 0.0095);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
const maxpexilratio = Math.min(window.devicePixelRatio, 2);
renderer.setPixelRatio(maxpexilratio);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 8;
camera.position.y = 3;
camera.position.x = 3;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enabled = false;
controls.enablePan = false;

// loading
const loadermanager = new LoadingManager();
let loadingComplete = false;
let appStarted = false;
// Create LoadingManager
const hero_menu_button = document.getElementById("hero_menu_button");
const bgLoader = document.getElementById("bg-loader");
const startScreen = document.getElementById("start-screen");
const rotateWarning = document.getElementById("rotate-warning");
const mainContent = document.getElementById("main-content");
let mainAnimationStart = null;
// Set up loading counter animation
loadermanager.onProgress = (_, loaded, total) => {
  let pct = String(Math.floor((loaded / total) * 100)).padStart(3, "0");
  pct.split("").forEach((n, i) => {
    document.querySelector(
      `#d${i + 1} .nums`
    ).style.transform = `translateY(-${n}em)`;
  });
};

// When loading completes
loadermanager.onLoad = () => {
  loadingComplete = true;
  bgLoader.style.opacity = "0";
  bgLoader.style.display = "none";
  // After fade out, check orientation and show appropriate screen
  setTimeout(() => {
    checkOrientation();

    // If orientation is correct, show start screen
    if (!isPortrait()) {
      startScreen.style.display = "flex";
      setTimeout(() => {
        startScreen.style.opacity = "1";
      }, 100);
    }
  }, 500);
};

// Check if device is in portrait mode
function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

// Check orientation and show/hide appropriate screens
function checkOrientation() {
  if (loadingComplete) {
    if (isPortrait()) {
      rotateWarning.style.display = "flex";
      startScreen.style.display = "none";
    } else {
      rotateWarning.style.display = "none";

      // If app hasn't started yet, show start screen
      if (!appStarted) {
        startScreen.style.display = "flex";
      } else {
        startScreen.style.display = "none";
      }
    }
  }
}

// Start the application when clicked

const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader(loadermanager);
const soundrayven = new THREE.PositionalAudio(listener);
const flyawaysound = new THREE.PositionalAudio(listener);
const explosionsound = new THREE.PositionalAudio(listener);
const entersound = new THREE.PositionalAudio(listener);
const activemenusound = new THREE.PositionalAudio(listener);
const hoveremenusound = new THREE.PositionalAudio(listener);
const bgsound = new THREE.PositionalAudio(listener);

audioLoader.load(
  "sound/dark-ambient-background-music-polluted-horizons-244007.mp3",
  (buffer) => {
    bgsound.setBuffer(buffer);
    bgsound.setLoop(false);
    bgsound.setVolume(0.2);
    bgsound.setRefDistance(20); // for 3D spatial effect
  }
);

audioLoader.load(
  "sound/zapsplat_multimedia_button_click_001_78078.mp3",
  (buffer) => {
    hoveremenusound.setBuffer(buffer);
    hoveremenusound.setLoop(false);
    hoveremenusound.setVolume(0.8);
    hoveremenusound.setRefDistance(20); // for 3D spatial effect
  }
);

audioLoader.load("sound/ui-sound-hover-270300.mp3", (buffer) => {
  activemenusound.setBuffer(buffer);
  activemenusound.setLoop(false);
  activemenusound.setVolume(0.9);
  activemenusound.setRefDistance(20); // for 3D spatial effect
});

camera.add(activemenusound);
camera.add(hoveremenusound);
camera.add(bgsound);
audioLoader.load("sound/enter.mp3", (buffer) => {
  entersound.setBuffer(buffer);
  entersound.setLoop(false);
  entersound.setVolume(0.7);
  entersound.setRefDistance(20); // for 3D spatial effect
});
audioLoader.load("sound/raven-call-72946.mp3", (buffer) => {
  soundrayven.setBuffer(buffer);
  soundrayven.setLoop(false);
  soundrayven.setVolume(0.4);
  soundrayven.setRefDistance(20); // for 3D spatial effect
});
audioLoader.load("sound/075692_bird-flying-awaywav-86143.mp3", (buffer) => {
  flyawaysound.setBuffer(buffer);
  flyawaysound.setLoop(false);
  flyawaysound.setVolume(0.3);
  flyawaysound.setRefDistance(20); // for 3D spatial effect
});
audioLoader.load("sound/left-page.mp3", (buffer) => {
  explosionsound.setBuffer(buffer);
  explosionsound.setLoop(false);
  explosionsound.setVolume(0.2);
  explosionsound.setRefDistance(20);
});

camera.add(explosionsound);
camera.add(entersound);
renderer.setSize(window.innerWidth, window.innerHeight);
const modelcont = document.querySelector(".car_cont");

modelcont.appendChild(renderer.domElement);

// make renderer for effects
const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 0.4;

//
let targetToneEffect = 0.0;
let currentToneEffect = 0.0;

let targetVignetteStrength = 0.0;
let currentVignetteStrength = 0.0;

// Set up event listeners for controls
let slowMotionScale = 1.0;
let slowMotionPrevTime = performance.now();

renderer.physicallyCorrectLights = true;
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const vignettePass = new ShaderPass(VignetteShader);
vignettePass.uniforms["offset"].value = 40.0; // increased to create a sharper vignette edge
vignettePass.uniforms["darkness"].value = 5.0; // set for a more defined darkness cutoff

composer.addPass(vignettePass);
pmremGenerator.compileEquirectangularShader();
//
function startApp() {
  if (loadingComplete && !isPortrait()) {
    appStarted = true;
    startScreen.style.opacity = "0";
    lockLandscape();
    setTimeout(() => {
      startScreen.style.display = "none";
      targetVignetteStrength = -0.01;
      bgsound.play();
      sheet.sequence.play().then(() => {
        animationcamera = false;
        controls.enabled = true;
        ui.style.transform = "translate3d(0, 0, 0)";
        hero_menu_button.style.transform = "translate3d(0, 0, 0)";
        setTimeout(() => {
          // controls.minPolarAngle = 0;
          // controls.maxPolarAngle = Math.PI / 2;
          // controls.enablePan = false;
          // controls.maxDistance = 15;
          // controls.minDistance = 3;
        }, 500);
      });

      mainAnimationStart = true;
    }, 300);

    // Remove event listener to prevent repeat
    document.removeEventListener("click", startApp);
  }
}

// Event listeners
document.addEventListener("click", startApp);
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);
new RGBELoader(loadermanager).load(
  "wasteland_clouds_puresky_4k.hdr",
  (BGhdr) => {
    BGhdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = BGhdr;
    scene.environment = BGhdr;
    BGhdr.castShadow = true;
  }
);
//TODO:
let CrowMixerQ;
new GLTFLoader(loadermanager).load("playingcrowGoodQ.glb", (gltf) => {
  const mesh = gltf.scene;
  mesh.position.set(2, 1.7, 0);
  mesh.scale.set(0.5, 0.5, 0.5);
  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  mesh.add(flyawaysound);
  mesh.add(soundrayven);
  scene.add(mesh);

  // Animation setup
  CrowMixerQ = new THREE.AnimationMixer(mesh); // or gltf.scene.children[0]
  const clips = gltf.animations;
  const clip1 = clips[1];
  const action1 = CrowMixerQ.clipAction(clip1);
  action1.reset().setLoop(THREE.LoopRepeat).play();

  //
  function checkMainAnimation() {
    if (mainAnimationStart) {
      soundrayven.play();
      setTimeout(() => {
        soundrayven.pause();
        action1.stop();
        const clip0 = clips[0];
        const action0 = CrowMixerQ.clipAction(clip0);
        action0.reset().setLoop(THREE.LoopOnce, 1);
        action0.clampWhenFinished = true;
        action0.play();

        flyawaysound.play();
        setTimeout(() => {
          scene.remove(mesh);
        }, 2000);
      }, 4500);
    } else {
      requestAnimationFrame(checkMainAnimation);
    }
  }

  checkMainAnimation();

  //

  // GUI controls (if needed)
  const playingcrowObj = sheet.object("PlayingCrow", {
    position: {
      x: mesh.position.x,
      y: mesh.position.y,
      z: mesh.position.z,
    },
  });

  playingcrowObj.onValuesChange((values) => {
    mesh.position.set(values.position.x, values.position.y, values.position.z);
  });
});

let CrowMixer;

new GLTFLoader(loadermanager).load("birdsfly.glb", (gltf) => {
  const mesh = gltf.scene;
  mesh.position.set(4, 142, 10);
  mesh.scale.set(0.5, 0.5, 0.5);
  scene.add(mesh);
  // Animation setup
  CrowMixer = new THREE.AnimationMixer(mesh); // or gltf.scene.children[0]
  const clips = gltf.animations;
  const clip = clips[0];
  const action = CrowMixer.clipAction(clip);
  toggle.addEventListener("change", () => {
    let tl = null;
    if (toggle.checked) {
      // Ensure tl is declared in an outer scope where accessible between events.
      tl = gsap.timeline({
        repeat: -1,
      });
      action.reset().setLoop(THREE.LoopRepeat).play();
      tl.to(mesh.position, {
        duration: 8,
        z: 4,
        ease: "power1.inOut",
      })
        .set(mesh.position, {
          z: 10,
        })
        .to(mesh.position, {
          duration: 8,
          z: 5,
          x: 5,
          y: 141,
          ease: "power1.inOut",
        })
        .set(mesh.position, {
          z: 10,
        })
        .to(mesh.position, {
          duration: 8,
          z: 8,
          x: 6,
          y: 142,
          ease: "power1.inOut",
        });
    } else {
      action.stop();
      gsap.killTweensOf(mesh.position);
      if (tl) {
        tl.kill();
        tl = null;
      }
    }
  });

  // GUI controls (if needed)
  const playingcrowssObj = sheet.object("PlayingCrowSS", {
    position: {
      x: mesh.position.x,
      y: mesh.position.y,
      z: mesh.position.z,
    },
  });

  playingcrowssObj.onValuesChange((values) => {
    mesh.position.set(values.position.x, values.position.y, values.position.z);
  });
});

new GLTFLoader(loadermanager).load("platform.glb", (gltf) => {
  const Mesh = gltf.scene;
  Mesh.scale.set(0.3, 0.3, 0.3);
  Mesh.position.set(0, 0, 0);

  Mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(Mesh);
});
new GLTFLoader(loadermanager).load("bmw_glb.glb", (gltf) => {
  const carMesh = gltf.scene;
  carMesh.rotateY(Math.PI / 2);
  carMesh.position.set(0, 0.35, 0);

  carMesh.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;

    // Just boost all materials
    if (child.material && child.material.isMeshStandardMaterial) {
      // child.material.envMap = envMap;
      child.material.envMapIntensity = 1.5;
      // child.material.metalness = 0.9;
      // child.material.roughness = 0.1;
      child.material.emissive = new THREE.Color(0x000000); // start black
      // child.material.emissiveIntensity = 0.15;
    }
  });

  const body = carMesh.getObjectByName("Object_5");

  // UI logic for color changing
  document.querySelectorAll("input[name=color_car]").forEach((rb) => {
    rb.addEventListener("change", () => {
      entersound.play();
      const newColor = new THREE.Color(rb.value);
      const highlight = newColor.clone().offsetHSL(0, 0.1, 0.2); // light tint

      body.traverse((piece) => {
        if (piece.material) {
          // Animate both base color and emissive
          gsap.to(piece.material.color, {
            r: newColor.r,
            g: newColor.g,
            b: newColor.b,
            duration: 1,
            ease: "power2.inOut",
          });
        }
      });
    });
  });

  scene.add(carMesh);
});
document.querySelectorAll("input[name=color_car]").forEach((rb) => {
  rb.addEventListener("mouseover", () => {
    hoveremenusound.play();
  });
});
const light = new THREE.DirectionalLight(0xffffff, 22);
light.position.set(0, 14, 28);
light.castShadow = true;
scene.add(light);

// Add light to Theatre for live control
const lightObj = sheet.object("DirectionalLight", {
  position: {
    x: light.position.x,
    y: light.position.y,
    z: light.position.z,
  },
  intensity: light.intensity,
});

lightObj.onValuesChange((values) => {
  light.position.set(values.position.x, values.position.y, values.position.z);
  light.intensity = values.intensity;
});
scene.add(light);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
//mouse light

// const lightmouseP =new THREE.Vector2();
// const lightmouse = new THREE.DirectionalLight(0xf783f7, 2);
// lightmouse.position.y = 130
// // lightmouse.castShadow = true;
// scene.add(lightmouse);
// document.addEventListener("mousemove", (event) => {
//   lightmouseP.x = (event.clientX / window.innerWidth) * 2 - 1;
//   lightmouseP.y = -(event.clientY / window.innerHeight) * 2 + 1;

//   lightmouse.position.x = lightmouseP.x * 4
//   lightmouse.position.z = lightmouseP.y * 4
// // console.log(lightmouseP.y + 120)

// });

//
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);
const clock = new THREE.Clock();
let animationcamera = null;
const cameraObj = sheet.object("Camera", {
  position: {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  },
  lookAt: {
    x: camera.position.x + 1,
    y: camera.position.y,
    z: camera.position.z,
  },
});

// Store latest Theatre values
let currentPos = { ...camera.position };
let currentLookAt = new THREE.Vector3(
  camera.position.x + 1,
  camera.position.y,
  camera.position.z
);

// Update latest values on change
cameraObj.onValuesChange((values) => {
  animationcamera = true;
  currentPos = {
    x: values.position.x,
    y: values.position.y,
    z: values.position.z,
  };
  currentLookAt.set(values.lookAt.x, values.lookAt.y, values.lookAt.z);
});

// Smooth interpolation factor (0.05 = smooth, 1 = instant)
let lerpFactor = 0.1;

// Animate loop

// modelcont.addEventListener("click", () => {

//   sheet.sequence.play();
// });
// //
//
// add menu

//
const textloader = new FontLoader(loadermanager);
//
const menuGroup = new THREE.Group();

const menuTEXT = [
  { text: "MY WORK", position: { x: -12.5, y: 0, z: 12.5 } },
  { text: "WHO IM", position: { x: 12.5, y: 0, z: 12.5 } },
  { text: "ABOUT", position: { x: -12.5, y: 0, z: -12.5 } },
  { text: "SETTINGS", position: { x: 12.5, y: 0, z: -12.5 } },
];
textloader.load("/NEXLABS/fonts/Orbitron_Regular.json", (font) => {
  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    envMapIntensity: 1.5, // increased reflection effect
    transparent: true,
    metalness: 1,
    roughness: 0.1,
  });

  menuTEXT.forEach((item) => {
    const textGeometry = new TextGeometry(item.text, {
      font: font,
      size: 2,
      height: 0.2,
      curveSegments: 2,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });

    textGeometry.center();

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.name = item.text; // <- assign name
    textMesh.scale.z = 0.008;
    textMesh.rotation.x = -Math.PI / 2;
    textMesh.position.set(item.position.x, item.position.y, item.position.z);
    textMesh.userData.originalPosition = textMesh.position.clone();
    // textMesh.receiveShadow = true;
    menuGroup.add(textMesh);
  });
});
// Add a simple cube to the scene
const cubeGeometry = new THREE.SphereGeometry(1);

const cubeMaterial = new THREE.MeshStandardMaterial({
  color: "black",
  envMapIntensity: 1.5, // increased reflection effect
  transparent: true,
  metalness: 1,
  roughness: 0.1,
});

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(5, 0.5, 5);
cube.name = "backButton";
cube.material.opacity = 0.0;
menuGroup.add(cube);
menuGroup.rotation.y = Math.PI / 8.7;
menuGroup.position.y = 120;
menuGroup.position.z = 5;
menuGroup.position.x = 3;
const element = document.getElementById("css3-hero");
const content = element.querySelector(".section-content");

const changeSectionCSSR3 = (option) => {
  const data = {
    "MY WORK": {
      html: `<ul><li><a href="https://astra-ecommerce.onrender.com" target="_blank">E-commerce website</a></li><li><a href="https://adamrhmni.github.io/astra-solar-system/?fbclid=PAY2xjawJx8gFleHRuA2FlbQIxMQABp3E47mJpad02ahc-Tov-yQwx2Se77Z3XQmmUrWCodrwAfmRpQWXaRAsHB2mR_aem_-fzfh5Y9-5usZdUNTX9UOg" target="_blank">solar system</a></li><li>Game using shaders</li></ul>`,
      rotateY: "-360deg",
      top: "50vh",
      left: "5vw",
    },
    "WHO IM": {
      html: `<p>I'm <a href="https://www.instagram.com/adam_rhmnii?igsh=MW5mdmtvZWpsdTB2bQ==" target="_blank">Adam</a>,ceo of NexLabs<br/>im a web dev, shaders artist,and UI/UX,i have working with R3F theater and im developing my own particle system lib , <a href="https://www.instagram.com/nex.labs?igsh=a3JpZHIyZzU3Nmo1" target="_blank">lets contect !</a></p>`,
      rotateY: "-360deg",
      top: "15vh",
      left: "15vw",
    },
    ABOUT: {
      html: "<p>I build interactive experiences using WebGL, shaders, and physics</p>",
      rotateY: "360deg",
      top: "35vh",
      left: "20vw",
    },
    SETTINGS: {
      html: `<label>Muted <input type='checkbox' id="mutedbutton"></label>`,
      rotateY: "360deg",
      top: "5vh",
      left: "10vw",
    },
  };

  if (option && data[option]) {
    const { html, rotateY, top, left } = data[option];

    element.style.opacity = 1;
    element.style.transform = `rotateY(${rotateY}) scale(1)`;
    element.style.top = top;
    element.style.left = left;

    element.querySelector("h1").innerHTML = option;
    content.innerHTML = html;
    if (option === "SETTINGS") {
      document.getElementById("mutedbutton").addEventListener("change", (u) => {
        if (u.target.checked) {
          bgsound.pause();
        } else {
          bgsound.play();
        }
      });
    }
  } else {
    element.style.opacity = 0;
    element.style.transform = "scale(0.95)";
    content.innerHTML = "";
  }
};

scene.add(menuGroup);
changeSectionCSSR3(null);
// TODO: use theater insted on this

const originalPosition = camera.position.clone();
const toggledPosition = new THREE.Vector3(
  originalPosition.x,
  144,
  originalPosition.z
);

toggle.addEventListener("change", () => {
  animationcamera = null;
  // lockLandscape();
  const isToggled = toggle.checked;
  const targetPosition = isToggled ? toggledPosition : originalPosition;
  ui.style.transform = "translate3d(-5rem, 0, 0)";
  if (!isToggled) {
    explosionsound.play();
    ui.style.transform = "translate3d(0, 0, 0)";
  }
  gsap.to(camera.position, {
    duration: 2,
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    ease: "power4.out",
    onStart: () => {
      controls.enabled = false;
    },
    onComplete: () => {
      if (!isToggled) {
        controls.enabled = true;
        controls.enablePan = false;
      }
    },
  });
});
//raycasting textmenu
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let LastMeshMenu = null;
let userdatamesh = null;

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(menuGroup.children);
  if (intersects.length > 0) {
    menuGroup.children.forEach((mesh) => {
      if (mesh.name === intersects[0].object.name) {
        activemenusound.play();
        if (!LastMeshMenu) {
          changeSectionCSSR3(intersects[0].object.name);
          cube.material.opacity = 1;
          const box = new THREE.Box3().setFromObject(mesh);
          const meshCenter = new THREE.Vector3();
          box.getCenter(meshCenter);
          // Step 2: OrbitControls target (where camera is looking)
          const viewTarget = controls.target.clone();
          // Step 3: Move mesh into view target
          const offset = new THREE.Vector3().subVectors(viewTarget, meshCenter);
          const finalMeshPos = mesh.position.clone().add(offset);
          gsap.to(mesh.position, {
            x: finalMeshPos.x + 3,
            y: finalMeshPos.y + 120,
            z: finalMeshPos.z + 5,
            duration: 1.2,
            ease: "power2.out",
          });
          // Step 4: Compute forward direction from camera to target
          const direction = new THREE.Vector3()
            .subVectors(viewTarget, camera.position)
            .normalize();
          const zoomAmount = 13; // negative = zoom in
          // Step 5: Final camera position after zoom
          const zoomTarget = camera.position
            .clone()
            .add(direction.multiplyScalar(zoomAmount));
          // Step 6: Animate camera zoom (while still looking at viewTarget)
          const startCamPos = camera.position.clone();
          const tempCam = new THREE.Vector3();
          const zoomAnim = { t: 0 };
          gsap.to(zoomAnim, {
            t: 1,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              tempCam.lerpVectors(startCamPos, zoomTarget, zoomAnim.t);
              camera.position.copy(tempCam);
              camera.lookAt(viewTarget);
            },
            onComplete: () => {
              controls.update(); // optional sync
            },
          });
          LastMeshMenu = mesh;
          userdatamesh = mesh.userData.originalPosition;
        } else {
          if (LastMeshMenu.name === mesh.name || mesh.name === "backButton") {
            if (mesh.name === "backButton") {
              changeSectionCSSR3(null);
              const box = new THREE.Box3().setFromObject(mesh);
              const meshCenter = new THREE.Vector3();
              box.getCenter(meshCenter);
              // Step 2: OrbitControls target (where camera is looking)
              const viewTarget = controls.target.clone();

              gsap.to(LastMeshMenu.position, {
                x: LastMeshMenu.userData.originalPosition.x,
                y: LastMeshMenu.userData.originalPosition.y,
                z: LastMeshMenu.userData.originalPosition.z,
                duration: 1.2,
                ease: "power2.out",
              });
              // Step 4: Compute forward direction from camera to target
              const direction = new THREE.Vector3()
                .subVectors(viewTarget, camera.position)
                .normalize();
              const zoomAmount = -13; // negative = zoom in
              // Step 5: Final camera position after zoom
              const zoomTarget = camera.position
                .clone()
                .add(direction.multiplyScalar(zoomAmount));
              // Step 6: Animate camera zoom (while still looking at viewTarget)
              const startCamPos = camera.position.clone();
              const tempCam = new THREE.Vector3();
              const zoomAnim = { t: 0 };
              gsap.to(zoomAnim, {
                t: 1,
                duration: 1.2,
                ease: "power2.out",
                onUpdate: () => {
                  tempCam.lerpVectors(startCamPos, zoomTarget, zoomAnim.t);
                  camera.position.copy(tempCam);
                  camera.lookAt(viewTarget);
                },
                onComplete: () => {
                  controls.update(); // optional sync
                },
              });
              LastMeshMenu = null;
              cube.material.opacity = 0.0;
            } else {
              changeSectionCSSR3(null);
              cube.material.opacity = 0.0;
              const box = new THREE.Box3().setFromObject(mesh);
              const meshCenter = new THREE.Vector3();
              box.getCenter(meshCenter);
              // Step 2: OrbitControls target (where camera is looking)
              const viewTarget = controls.target.clone();

              gsap.to(mesh.position, {
                x: mesh.userData.originalPosition.x,
                y: mesh.userData.originalPosition.y,
                z: mesh.userData.originalPosition.z,
                duration: 1.2,
                ease: "power2.out",
              });
              // Step 4: Compute forward direction from camera to target
              const direction = new THREE.Vector3()
                .subVectors(viewTarget, camera.position)
                .normalize();
              const zoomAmount = -13; // negative = zoom in
              // Step 5: Final camera position after zoom
              const zoomTarget = camera.position
                .clone()
                .add(direction.multiplyScalar(zoomAmount));
              // Step 6: Animate camera zoom (while still looking at viewTarget)
              const startCamPos = camera.position.clone();
              const tempCam = new THREE.Vector3();
              const zoomAnim = { t: 0 };

              gsap.to(zoomAnim, {
                t: 1,
                duration: 1.2,
                ease: "power2.out",
                onUpdate: () => {
                  tempCam.lerpVectors(startCamPos, zoomTarget, zoomAnim.t);
                  camera.position.copy(tempCam);
                  camera.lookAt(viewTarget);
                },
                onComplete: () => {
                  controls.update(); // optional sync
                },
              });
              LastMeshMenu = null;
            }
          }
        }
      }
    });
  }
});

let localLastMesh = null;
window.addEventListener("mousemove", (evt) => {
  const localMouse = new THREE.Vector2(
    (evt.clientX / window.innerWidth) * 2 - 1,
    -(evt.clientY / window.innerHeight) * 2 + 1
  );
  const localRaycaster = new THREE.Raycaster();
  localRaycaster.setFromCamera(localMouse, camera);
  const localIntersects = localRaycaster.intersectObjects(menuGroup.children);

  if (localIntersects.length > 0) {
    document.body.style.cursor = "pointer";
    const currentHovered = localIntersects[0].object;
    // If a different mesh is hovered, revert the previous one if it's not the backButton
    if (
      localLastMesh &&
      localLastMesh !== currentHovered &&
      localLastMesh.name !== "backButton"
    ) {
      gsap.to(localLastMesh.rotation, {
        x: localLastMesh.userData.originalRotation,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
    // Only animate non-backButton meshes
    if (currentHovered.name !== "backButton") {
      if (currentHovered.userData.originalRotation === undefined) {
        currentHovered.userData.originalRotation = currentHovered.rotation.x;
      }
      gsap.to(currentHovered.rotation, {
        x: currentHovered.userData.originalRotation + Math.PI * 2,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
    localLastMesh = currentHovered;
  } else {
    document.body.style.cursor = "default";
    if (localLastMesh && localLastMesh.name !== "backButton") {
      gsap.to(localLastMesh.rotation, {
        x: localLastMesh.userData.originalRotation,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
    localLastMesh = null;
  }
});

//
controls.addEventListener("start", () => {
  targetToneEffect = -0.2;
  ui.style.transform = "translate3d(-5rem, 0, 0)";
  hero_menu_button.style.transform = "translate3d(5rem, 0, 0)";
  slowMotionScale = 0.5;

  // Apply a lowpass filter effect with a smooth transition to bgsound
  const audioContext = bgsound.context;
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  // Start with a high cutoff frequency
  filter.frequency.value = 22050;
  bgsound.setFilter(filter);

  // Smoothly lower the cutoff frequency to 1000 Hz over 1 second
  gsap.to(filter.frequency, {
    value: 1000,
    duration: 2,
    ease: "power2.out",
  });
});

controls.addEventListener("end", () => {
  targetToneEffect = 0.0;
  ui.style.transform = "translate3d(0, 0, 0)";
  hero_menu_button.style.transform = "translate3d(0, 0, 0)";
  slowMotionScale = 1.0;

  // Smoothly ramp the cutoff frequency back to 22050 Hz and then remove the filter
  const currentFilter = bgsound.getFilter();
  if (currentFilter) {
    gsap.to(currentFilter.frequency, {
      value: 22050,
      duration: 2,
      ease: "power2.out",
      onComplete: () => {
        bgsound.setFilter(null);
      },
    });
  } else {
    bgsound.setFilter(null);
  }
});
function animate(time) {
  requestAnimationFrame(animate);
  // watermat.uniforms.u_Time.value = time;
  const currentTime = performance.now();
  let timeDelta = (currentTime - slowMotionPrevTime) / 1000;
  slowMotionPrevTime = currentTime;
  timeDelta *= slowMotionScale;
  if (animationcamera) {
    camera.position.lerp(
      new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z),
      lerpFactor
    );
    // Interpolate lookAt target
    const interpolatedTarget = new THREE.Vector3().copy(
      camera.getWorldDirection(new THREE.Vector3())
    );
    interpolatedTarget.lerp(
      currentLookAt.clone().sub(camera.position),
      lerpFactor
    );
    camera.lookAt(camera.position.clone().add(interpolatedTarget));
  }
  const delta = clock.getDelta(); // only call once per frame
  if (CrowMixer) CrowMixer.update(delta);
  if (CrowMixerQ) CrowMixerQ.update(delta);
  //
  const density = 0.001 + Math.sin(time * 0.0005) * 0.001;
  scene.fog.density = density;
  // === Tone mapping effect ===
  if (currentToneEffect !== targetToneEffect) {
    currentToneEffect += (targetToneEffect - currentToneEffect) * 0.1;
    renderer.toneMappingExposure = 0.4 + currentToneEffect;
  }
  // === Vignette animation ===
  if (currentVignetteStrength !== targetVignetteStrength) {
    currentVignetteStrength +=
      (targetVignetteStrength - currentVignetteStrength) * 0.1;
    vignettePass.uniforms["offset"].value = THREE.MathUtils.lerp(
      vignettePass.uniforms["offset"].value,
      0.001,
      1.5
    );
    vignettePass.uniforms["darkness"].value = THREE.MathUtils.lerp(
      vignettePass.uniforms["darkness"].value,
      currentVignetteStrength * 0.6, // control edge darkness
      0.2
    );
  }
  composer.render();
  controls.update();
  // menuGroup.rotation.z += 0.01;
}
animate();

