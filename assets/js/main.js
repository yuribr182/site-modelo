/* ============================================================
   MODELO® — todas as animações do site
   Stack: GSAP + ScrollTrigger + SplitText + Lenis
   ============================================================ */

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------- 1. Scroll suave (Lenis) integrado ao ScrollTrigger ---------- */
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const mm = gsap.matchMedia();

/* Quem prefere menos movimento vê o site pronto, sem animações. */
mm.add("(prefers-reduced-motion: reduce)", () => {
  gsap.set("#preloader", { display: "none" });
  gsap.set(".manifesto__text", { opacity: 1 });
  document.querySelectorAll(".stat__num").forEach((el) => {
    el.textContent = el.dataset.count;
  });
});

mm.add("(prefers-reduced-motion: no-preference)", () => {

  /* ---------- 2. Preloader: contador 0→100 e cortina ---------- */
  lenis.stop();
  const counter = { value: 0 };
  const countEl = document.getElementById("preloaderCount");

  const intro = gsap.timeline({ onComplete: () => lenis.start() });
  intro
    .to(counter, {
      value: 100,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => (countEl.textContent = Math.round(counter.value)),
    })
    .to("#preloader", { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
    .add(revealHero, "-=0.35");

  /* ---------- 3. Hero: título revelado linha por linha (SplitText) ---------- */
  const heroSplit = SplitText.create("#heroTitle", {
    type: "lines",
    mask: "lines", // cada linha ganha um "envelope" com overflow:hidden
    autoSplit: true,
  });

  gsap.set(heroSplit.lines, { yPercent: 110 });
  gsap.set(".reveal-hero", { opacity: 0, y: 20 });

  function revealHero() {
    gsap.timeline()
      .to(heroSplit.lines, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.09,
        ease: "power4.out",
      })
      .to(".reveal-hero", { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, "-=0.6");
  }

  /* Blobs do fundo flutuando em loop */
  gsap.to(".blob--1", { x: "12vw", y: "10vh", duration: 9, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".blob--2", { x: "-10vw", y: "-12vh", duration: 11, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".blob--3", { x: "8vw", y: "-8vh", duration: 7, yoyo: true, repeat: -1, ease: "sine.inOut" });

  /* Hero sai de cena com parallax conforme o scroll */
  gsap.to(".hero__content", {
    yPercent: -25,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- 4. Manifesto: palavras acendem uma a uma (scrub) ---------- */
  const manifestoSplit = SplitText.create("#manifestoText", {
    type: "words",
    wordsClass: "word",
    autoSplit: true,
  });

  gsap.to(manifestoSplit.words, {
    opacity: 1,
    stagger: 0.06,
    ease: "none",
    scrollTrigger: {
      trigger: ".manifesto",
      start: "top 70%",
      end: "bottom 80%",
      scrub: true,
    },
  });

  /* ---------- 5. Serviços: cards em cascata (batch) ---------- */
  ScrollTrigger.batch(".service-card", {
    start: "top 85%",
    once: true,
    onEnter: (cards) =>
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }),
  });

  /* ---------- 6. Projetos: pin + scroll horizontal + parallax interno ---------- */
  const track = document.getElementById("projectsTrack");

  const scrollTween = gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: "none", // obrigatório: mantém o scroll e o movimento 1:1
    scrollTrigger: {
      trigger: ".projects",
      pin: true,
      scrub: 1,
      start: "top top",
      end: () => "+=" + (track.scrollWidth - window.innerWidth),
      invalidateOnRefresh: true,
    },
  });

  /* Parallax das "imagens" enquanto a faixa anda na horizontal */
  document.querySelectorAll("[data-parallax]").forEach((media) => {
    gsap.fromTo(
      media,
      { backgroundPosition: "0% 50%" },
      {
        backgroundPosition: "100% 50%",
        ease: "none",
        scrollTrigger: {
          containerAnimation: scrollTween,
          trigger: media,
          start: "left right",
          end: "right left",
          scrub: true,
        },
      }
    );
  });

  /* ---------- 7. Números: contadores ---------- */
  document.querySelectorAll(".stat__num").forEach((el) => {
    const target = +el.dataset.count;
    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => (el.textContent = Math.round(obj.value)),
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });

  /* ---------- 8. Marquee infinita ---------- */
  gsap.to("#marqueeInner", { xPercent: -50, duration: 18, repeat: -1, ease: "none" });

  /* ---------- 9. CTA final: título revelado + botão magnético ---------- */
  const ctaSplit = SplitText.create("#ctaTitle", { type: "lines", mask: "lines", autoSplit: true });
  gsap.from(ctaSplit.lines, {
    yPercent: 110,
    duration: 1,
    stagger: 0.1,
    ease: "power4.out",
    scrollTrigger: { trigger: ".footer-cta", start: "top 60%", once: true },
  });

  const btn = document.getElementById("magneticBtn");
  const btnX = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
  const btnY = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    btnX((e.clientX - rect.left - rect.width / 2) * 0.35);
    btnY((e.clientY - rect.top - rect.height / 2) * 0.35);
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  });

  /* ---------- 10. Cursor customizado ---------- */
  const cursor = document.getElementById("cursor");
  const cursorX = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3.out" });
  const cursorY = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3.out" });

  window.addEventListener("mousemove", (e) => {
    gsap.set(cursor, { opacity: 1 });
    cursorX(e.clientX);
    cursorY(e.clientY);
  });
  document.querySelectorAll("[data-hover]").forEach((el) => {
    el.addEventListener("mouseenter", () => gsap.to(cursor, { scale: 3, duration: 0.3 }));
    el.addEventListener("mouseleave", () => gsap.to(cursor, { scale: 1, duration: 0.3 }));
  });
});

/* As fontes mudam a altura das linhas — recalcula as posições dos triggers */
document.fonts.ready.then(() => ScrollTrigger.refresh());
