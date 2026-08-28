# Como se faz um site com produto 3D real (o lanche que desmonta no scroll)

Este documento explica **o processo completo** por trás de sites como o do reel:
um lanche girando em 3D que separa os ingredientes conforme você rola a página.
A demo funcional está em `burger.html` deste repositório.

---

## 1. A verdade que os cursos não contam

O site tem **duas partes independentes**, e a parte difícil não é o código:

```
[ MODELO 3D ]  →  [ CÓDIGO DO SITE ]
   (o lanche)       (girar/desmontar no scroll)
   80% do visual    ~200 linhas de JavaScript
```

O código do site é quase sempre o mesmo (está em `assets/js/burger.js`, comentado).
**O que muda o resultado de "meh" para "uau" é a qualidade do modelo 3D.**
Quem faz aqueles sites ou compra o modelo pronto, ou contrata um artista 3D,
ou modela no Blender.

## 2. As 3 técnicas usadas nesses reels

### Técnica A — 3D de verdade no navegador (a desta demo)
- Um arquivo **glTF/GLB** (o "JPEG do 3D") é carregado com **Three.js**.
- Cada ingrediente é um **objeto separado** dentro do arquivo.
- O **GSAP ScrollTrigger** amarra o scroll à rotação e ao afastamento das peças.
- Vantagens: interativo (gira com o mouse), leve, animável à vontade.
- É o que fizemos: `burger.glb` (1,5 MB) + `burger.js`.

### Técnica B — Sequência de imagens (a "trapaça" da Apple)
- O lanche é renderizado no Blender/Cinema 4D como **150–300 fotos** (frames).
- No site, um `<canvas>` troca a foto conforme o scroll (scrub de vídeo).
- Vantagem: **fotorrealismo perfeito** (é um render offline, pode levar horas).
- Desvantagem: pesado (muitos MB), não é interativo de verdade.
- Muitos sites "impressionantes" de reel usam isso — não há 3D rodando, só fotos.
- Esqueleto do código:

```js
const frames = []; // 200 imagens pré-carregadas
gsap.to(state, {
  frame: 199, snap: "frame", ease: "none",
  scrollTrigger: { scrub: 0.5, start: "top top", end: "+=4000", pin: true },
  onUpdate: () => ctx.drawImage(frames[state.frame], 0, 0),
});
```

### Técnica C — Spline (sem código)
- [spline.design](https://spline.design) é um editor 3D no navegador, estilo Figma.
- Você importa/modela o lanche, cria a animação de scroll visualmente
  e exporta um embed para o site. Zero JavaScript.
- É o caminho mais rápido para quem não programa; menos controle fino.

## 3. De onde vem o modelo 3D do lanche

| Fonte | Custo | Realismo |
|---|---|---|
| **Modelar no Blender** (grátis, blender.org) | tempo | você decide |
| **Sketchfab / Fab** — busque "burger" + filtro *downloadable* | grátis a ~US$30 | alto |
| **CGTrader / TurboSquid** | US$5–50 | altíssimo |
| **Poly Pizza / Kenney Food Kit** (CC0, grátis) | grátis | estilizado |
| **Fotogrametria**: fotografar um lanche REAL com o app Polycam/RealityScan e gerar o 3D | grátis | é uma foto 3D do lanche real |

> A fotogrametria é o segredo dos casos "parece comida de verdade":
> é comida de verdade, escaneada.

**Requisito para a animação de desmontar**: os ingredientes precisam ser
**objetos separados** no arquivo (procure "separated parts" / "exploded").
Se vier tudo colado, abra no Blender e separe (tecla `P` → *By Loose Parts*).

## 4. O pipeline desta demo, passo a passo

```
tools/make_burger.py  →  assets/models/burger.glb  →  burger.html + burger.js
     (Blender)              (modelo exportado)           (Three.js + GSAP)
```

1. **Blender** (`tools/make_burger.py`): cada ingrediente é criado como um objeto
   com nome próprio (`BunTop`, `Patty`, `Cheese`…), materiais PBR, modificadores
   de ruído para o aspecto orgânico, e exportado com `export_scene.gltf`.
   Normalmente você faria isso à mão na interface do Blender — o script faz o
   mesmo via código (rode com `pip install bpy && python3 tools/make_burger.py`).
2. **Three.js** (`assets/js/burger.js`):
   - `GLTFLoader` carrega o `.glb`;
   - `RoomEnvironment` gera iluminação de estúdio sem precisar de arquivos HDRI;
   - o canvas fica **fixo** cobrindo a tela, o texto rola por cima.
3. **GSAP ScrollTrigger**: uma única timeline com `scrub` amarrada à página inteira:
   - gira o lanche continuamente (`rotation.y`);
   - um valor `explode.t` vai de 0→1 e cada peça anda `baseY + offset * t`;
   - a câmera afasta para caber tudo, e no final `t` volta a 0 (remonta).
4. **Lenis** dá o scroll suave que deixa tudo com cara cara de premium.

## 5. Como trocar pelo SEU lanche (fotorrealista)

1. Baixe/compre/escaneie um modelo `.glb` com partes separadas.
2. Substitua `assets/models/burger.glb`.
3. Abra o modelo em https://gltf.report (mostra os nomes dos objetos).
4. Ajuste o mapa `EXPLODE` no `burger.js` com esses nomes:

```js
const EXPLODE = { PaoDeCima: 1.7, Bacon: 0.9, ... };
```

Pronto — o resto do código não muda. É exatamente assim que os sites dos
reels funcionam.

## 6. IA que cria o modelo 3D a partir de uma FOTO do seu lanche

Existe, e é o caminho mais rápido para o resultado do reel. São as IAs
**imagem → 3D** (todas exportam `.glb`, que encaixa direto no `burger.js`):

| Ferramenta | Tipo | Observação |
|---|---|---|
| **Meshy** (meshy.ai) | web, tem plano grátis | a mais equilibrada; texturas PBR prontas |
| **Tripo** (tripo3d.ai) | web, tem plano grátis | rápida, boa geometria |
| **Rodin / Hyper3D** (hyper3d.ai) | web | qualidade topo de linha |
| **Hunyuan3D** (Tencent) | open source | roda de graça no Hugging Face |
| **TRELLIS** (Microsoft) | open source | idem |
| **Polycam / RealityScan / KIRI** | app de celular | fotogrametria: você filma o lanche real girando — o resultado É o seu lanche |

### O truque que ninguém conta: gere POR INGREDIENTE

Uma foto do lanche **fechado** vira **uma peça única** — não dá para desmontar.
Para ter o efeito do reel:

1. Monte os ingredientes separados numa bancada: pão de cima, pão de baixo,
   carne, queijo, alface, tomate — **fotografe cada um** (luz boa, fundo neutro).
2. Suba **uma foto por ingrediente** na Meshy/Tripo → baixe um `.glb` de cada.
3. No site, carregue os arquivos e ajuste o mapa `EXPLODE` com um nome por peça
   (ou junte tudo num único `.glb` no Blender: File → Import → glTF, empilhe,
   renomeie os objetos e exporte).

Com fotogrametria (Polycam etc.) vale o mesmo: escaneie cada ingrediente
separado. O resultado é literalmente o SEU lanche em 3D, fotorrealista.

## 7. Ferramentas e skills instaladas neste repositório

- `.claude/skills/threejs-webgl` — Three.js completo (cenas, materiais, luz)
- `.claude/skills/blender-web-pipeline` — exportar do Blender para a web
- `.claude/skills/web3d-integration-patterns` — arquitetura 3D + ScrollTrigger
- `.claude/skills/spline-interactive` — o caminho sem código
- `.claude/skills/gsap-*` e `awwwards-animations` — animação e scroll (já instaladas antes)

Fontes: [Three.js](https://threejs.org) · [GSAP](https://gsap.com) ·
[Lenis](https://lenis.darkroom.engineering) · [Blender](https://blender.org) ·
[Spline](https://spline.design) · [Sketchfab](https://sketchfab.com) ·
[Poly Pizza](https://poly.pizza) · [Kenney Food Kit](https://kenney.nl/assets/food-kit)
