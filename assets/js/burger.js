/* ============================================================
   SMASH® — lanche 3D desmontado pelo scroll
   Three.js (renderiza o modelo) + ScrollTrigger (comanda tudo)
   ============================================================ */

import * as THREE from "three";
import { GLTFLoader } from "../vendor/three/GLTFLoader.js";
import { RoomEnvironment } from "../vendor/three/RoomEnvironment.js";

gsap.registerPlugin(ScrollTrigger);

/* ---------- Scroll suave ---------- */
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- Cena 3D ---------- */
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();

/* Iluminação de estúdio sem precisar de arquivos HDRI:
   o RoomEnvironment gera reflexos suaves para materiais PBR. */
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const keyLight = new THREE.DirectionalLight(0xfff2e0, 2.2);
keyLight.position.set(3, 5, 4);
scene.add(keyLight);
scene.add(new THREE.AmbientLight(0xffe8d0, 0.5));

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0.2, 5.4);

/* rig = flutuação ocasional | model = rotação e explosão */
const rig = new THREE.Group();
const model = new THREE.Group();
rig.add(model);
scene.add(rig);

/* Quanto cada ingrediente viaja quando o lanche "abre" (eixo Y) */
const EXPLODE = {
  BunBottom: -0.95,
  Patty: -0.45,
  Cheese: -0.15,
  Tomato: 0.25,
  Lettuce: 0.68,
  Onion: 1.15,
  BunTop: 1.7,
  Seeds: 1.7, // o gergelim acompanha o pão de cima
};

const parts = [];   // { mesh, baseY, offset }

/* A luz quente + tone mapping lavam as cores exportadas do Blender;
   aqui recalibramos cada material para o tom final de "comida de anúncio". */
const COLOR_GRADE = {
  Bun: 0xd9853a,
  Seed: 0xf2ddb0,
  Patty: 0x3d1d0c,
  Cheese: 0xf2a413,
  Tomato: 0xc21f10,
  Lettuce: 0x4c8f22,
  Onion: 0xe8dff0,
};

new GLTFLoader().load("assets/models/burger.glb", (gltf) => {
  /* Centraliza o lanche na origem para girar no próprio eixo */
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  gltf.scene.position.sub(center);
  model.add(gltf.scene);

  gltf.scene.traverse((node) => {
    if (!node.isMesh) return;
    const grade = COLOR_GRADE[node.material?.name];
    if (grade) {
      node.material.color.set(grade);
      node.material.envMapIntensity = 0.55;
    }
    if (EXPLODE[node.name] !== undefined) {
      parts.push({ mesh: node, baseY: node.position.y, offset: EXPLODE[node.name] });
    }
  });

  document.getElementById("loader").style.display = "none";
  ScrollTrigger.refresh();
  startAnimations();
});

/* ---------- Loop de render ---------- */
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

gsap.ticker.add(() => {
  /* Parallax sutil seguindo o mouse (interpolado para suavizar) */
  rig.rotation.y += (mouse.x * 0.18 - rig.rotation.y) * 0.05;
  rig.rotation.x += (mouse.y * 0.1 - rig.rotation.x) * 0.05;
  renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------- Scroll comanda o 3D ---------- */
function startAnimations() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    document.querySelectorAll(".label").forEach((l) => gsap.set(l, { opacity: 1, y: 0 }));
    return;
  }

  /* Flutuação constante, como um produto em vitrine */
  gsap.to(rig.position, { y: 0.08, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" });

  /* "explode.t" vai de 0 (montado) a 1 (aberto). Uma única timeline,
     amarrada ao scroll da página inteira com scrub. */
  const explode = { t: 0 };
  const applyExplode = () => {
    for (const p of parts) {
      p.mesh.position.y = p.baseY + p.offset * explode.t;
    }
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
    },
  });

  tl.to(model.rotation, { y: Math.PI * 3, duration: 10 }, 0)              // gira o tempo todo
    .to(explode, { t: 1, duration: 3.5, onUpdate: applyExplode }, 1)      // abre os ingredientes
    .to(camera.position, { z: 6.6, y: 0.4, duration: 3.5 }, 1)            // afasta p/ caber tudo
    .to(explode, { t: 0, duration: 2, onUpdate: applyExplode }, 7.6)      // monta de novo
    .to(camera.position, { z: 5.4, y: 0.2, duration: 2 }, 7.6);

  /* Título do hero e do final */
  gsap.from("#heroTitle", { opacity: 0, y: 60, duration: 1.2, ease: "power4.out", delay: 0.1 });
  gsap.to(".panel--hero", {
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".panel--hero", start: "top top", end: "bottom 40%", scrub: true },
  });
  gsap.from("#endTitle", {
    opacity: 0,
    y: 60,
    duration: 1,
    ease: "power4.out",
    scrollTrigger: { trigger: ".panel--end", start: "top 55%", once: true },
  });

  /* Rótulos dos ingredientes entram e saem conforme o painel passa */
  document.querySelectorAll(".label").forEach((label) => {
    gsap.to(label, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: label.closest(".panel"),
        start: "top 55%",
        end: "bottom 45%",
        toggleActions: "play reverse play reverse",
      },
    });
  });
}
