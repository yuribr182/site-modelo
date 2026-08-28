/* ============================================================
   FRONT BURGUER — hero com vídeo controlado pelo scroll
   Técnica "image sequence": 120 frames extraídos do vídeo de IA
   são desenhados num canvas conforme a posição do scroll.
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;
const framePath = (i) => `assets/frames/frame_${String(i + 1).padStart(3, "0")}.webp`;

const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
const loaderEl = document.getElementById("loader");
const loaderCount = document.getElementById("loaderCount");

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Scroll suave ---------- */
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- Pré-carrega os frames ---------- */
const frames = new Array(FRAME_COUNT);
let loadedCount = 0;
let maxReady = 0;            // maior índice contíguo já carregado
const playhead = { frame: 0 };

for (let i = 0; i < FRAME_COUNT; i++) {
  const img = new Image();
  img.src = framePath(i);
  img.onload = () => {
    frames[i] = img;
    loadedCount++;
    while (maxReady < FRAME_COUNT - 1 && frames[maxReady + 1]) maxReady++;
    const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    loaderCount.textContent = pct + "%";
    if (i === 0) { resize(); render(); }
    /* Libera a página com 15% carregado; o resto chega durante o scroll */
    if (pct >= 15 && !loaderEl.classList.contains("done")) {
      loaderEl.classList.add("done");
      gsap.to(loaderEl, { opacity: 0, duration: 0.6, onComplete: () => (loaderEl.style.display = "none") });
    }
  };
}

/* ---------- Desenho estilo "object-fit: cover" ---------- */
function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  render();
}
window.addEventListener("resize", resize);

function render() {
  const img = frames[Math.min(Math.round(playhead.frame), maxReady)];
  if (!img) return;
  const cw = canvas.width, ch = canvas.height;
  const scale = Math.max(cw / img.width, ch / img.height);
  const w = img.width * scale, h = img.height * scale;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

/* ---------- Scroll comanda o vídeo ---------- */
if (!reduced) {
  /* O hero fica "preso" por 3,5 telas; nesse trajeto o vídeo inteiro roda.
     Rolar para trás rebobina — os ingredientes voltam para o lugar. */
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=350%",
      pin: true,
      scrub: 0.5,
    },
  });

  tl.to(playhead, { frame: FRAME_COUNT - 1, duration: 10, onUpdate: render }, 0)

    /* título some enquanto o lanche começa a abrir */
    .to("#heroTitle", { opacity: 0, y: -60, duration: 1.2 }, 0.2)

    /* rótulos entram e saem sincronizados com a abertura do vídeo */
    .fromTo("#heroLabel1", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8 }, 1.8)
    .to("#heroLabel1", { opacity: 0, x: -40, duration: 0.6 }, 6.4)
    .fromTo("#heroLabel2", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8 }, 3.0)
    .to("#heroLabel2", { opacity: 0, x: 40, duration: 0.6 }, 6.8)
    .fromTo("#heroLabel3", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, 4.4)
    .to("#heroLabel3", { opacity: 0, y: 40, duration: 0.6 }, 7.2)

    /* lanche remontado: chamada final */
    .fromTo("#heroEnd", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, 8.6);

  /* ---------- Reveals das seções seguintes ---------- */
  ScrollTrigger.batch(".menu-card", {
    start: "top 85%",
    once: true,
    onEnter: (cards) =>
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }),
  });

  gsap.utils.toArray(".section-head, .about__text, .info-card, .order h2").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
} else {
  /* Sem animação: mostra o lanche montado e todo o conteúdo */
  playhead.frame = 0;
}

/* Recalcula as posições quando as fontes chegam */
document.fonts.ready.then(() => ScrollTrigger.refresh());
