import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** Procedural geometry: no remote models or runtime APIs. */
export function createScene(canvas, { paused = false } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x131512, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 10.7);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const assembly = new THREE.Group();
  scene.add(assembly);
  const sculpture = new THREE.Group();
  assembly.add(sculpture);
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xd9ded1,
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 2.3,
  });
  const core = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.15, 0.38, 220, 48, 2, 3),
    chrome,
  );
  core.rotation.set(0.3, 0.2, -0.4);
  sculpture.add(core);
  const lime = new THREE.MeshStandardMaterial({
    color: 0xc7f464,
    roughness: 0.33,
    metalness: 0.1,
  });
  const cube = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.43, 0.43), lime);
  cube.position.set(-1.7, 1.8, 0.6);
  cube.rotation.set(0.6, 0.7, 0.2);
  assembly.add(cube);
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45, 0),
    new THREE.MeshPhysicalMaterial({
      color: 0xe8eedd,
      roughness: 0.12,
      metalness: 0.7,
      clearcoat: 1,
      envMapIntensity: 1.7,
    }),
  );
  crystal.position.set(1.9, -1.4, 0.4);
  crystal.rotation.set(0.1, 0.7, 0.2);
  assembly.add(crystal);
  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 24, 16),
    lime,
  );
  satellite.position.set(1.8, 1.65, -0.4);
  assembly.add(satellite);
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.007, 8, 180),
    new THREE.MeshBasicMaterial({
      color: 0x81905c,
      transparent: true,
      opacity: 0.28,
    }),
  );
  orbit.rotation.set(1.3, 0.4, 0.2);
  assembly.add(orbit);
  const key = new THREE.DirectionalLight(0xf7ffe9, 5);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd3fc93, 4);
  rim.position.set(4, -1, -2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xc7daef, 1.5);
  fill.position.set(-2, -3, 2);
  scene.add(fill);
  let visible = true;
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let isPaused = paused;
  let dragging = false;
  let last = { x: 0, y: 0 };
  const rotation = { x: 0.15, y: -0.35 };
  const target = { x: 0.15, y: -0.35 };
  let form = 1;
  function render() {
    renderer.render(scene, camera);
  }
  function resize() {
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    assembly.scale.setScalar(camera.aspect < 0.9 ? 0.91 : 1);
    render();
  }
  function tick(time) {
    frame = 0;
    if (!visible) return;
    const delta = previousTime
      ? Math.min((time - previousTime) / 1000, 0.05)
      : 0;
    previousTime = time;
    if (!isPaused && !dragging) {
      elapsed += delta;
      target.y += delta * 0.12;
      sculpture.position.y = Math.sin(elapsed * 0.75) * 0.13;
      cube.position.y = 1.8 + Math.sin(elapsed * 0.85) * 0.18;
      cube.rotation.y += delta * 0.25;
      cube.rotation.z += delta * 0.12;
      crystal.position.y = -1.4 + Math.sin(elapsed * 0.8 + 2) * 0.17;
      crystal.rotation.y -= delta * 0.22;
      satellite.position.y = 1.65 + Math.cos(elapsed * 0.5) * 0.15;
    }
    rotation.x += (target.x - rotation.x) * 0.08;
    rotation.y += (target.y - rotation.y) * 0.08;
    sculpture.rotation.set(rotation.x, rotation.y, 0);
    render();
    const moving =
      Math.abs(target.x - rotation.x) + Math.abs(target.y - rotation.y) > 0.001;
    if (!isPaused || moving) frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!frame && visible) {
      previousTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    last = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    target.y += (event.clientX - last.x) * 0.008;
    target.x = THREE.MathUtils.clamp(
      target.x + (event.clientY - last.y) * 0.006,
      -1.3,
      1.3,
    );
    last = { x: event.clientX, y: event.clientY };
    schedule();
  });
  function endDrag() {
    dragging = false;
    schedule();
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("lostpointercapture", endDrag);
  canvas.addEventListener("keydown", (event) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    if (event.key === "ArrowLeft") target.y -= 0.2;
    if (event.key === "ArrowRight") target.y += 0.2;
    if (event.key === "ArrowUp") target.x = Math.max(-1.3, target.x - 0.2);
    if (event.key === "ArrowDown") target.x = Math.min(1.3, target.x + 0.2);
    schedule();
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    canvas.hidden = true;
    canvas.parentElement.classList.remove("scene-ready");
    document.querySelector(".drag-hint").textContent = "A study in form";
  });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement);
  resize();
  schedule();
  return {
    setPaused(value) {
      isPaused = value;
      schedule();
    },
    setVisible(value) {
      visible = value;
      if (!value) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        resize();
        schedule();
      }
    },
    remix() {
      form = (form % 3) + 1;
      core.geometry.dispose();
      core.geometry =
        form === 1
          ? new THREE.TorusKnotGeometry(1.15, 0.38, 220, 48, 2, 3)
          : form === 2
            ? new THREE.TorusGeometry(1.3, 0.53, 48, 120)
            : new THREE.IcosahedronGeometry(1.65, 0);
      target.y += Math.PI / 3;
      schedule();
      return form;
    },
  };
}
