# Site Modelo — Sites com animações premium (nível Awwwards)

Este repositório está preparado para criar sites como os que aparecem nos reels do Instagram:
páginas com scroll suave, textos que se revelam, seções que "grudam" na tela (pin),
parallax, vídeos de fundo e micro-interações.

## Como esses sites são feitos (o processo real)

Os vídeos que viralizam vendendo curso mostram quase sempre a mesma receita técnica.
Não existe segredo — é esta stack:

### 1. A stack de tecnologia

| Camada | Ferramenta | Para que serve |
|---|---|---|
| Estrutura | HTML/CSS/JS puro, ou **React/Next.js**, ou **Astro/Vite** | A base do site |
| Animações | **GSAP** (GreenSock) | O motor de praticamente TODAS as animações desses vídeos |
| Scroll | **GSAP ScrollTrigger** | Animações disparadas/controladas pelo scroll: parallax, pin, scrub |
| Scroll suave | **Lenis** | Aquele deslizar "amanteigado" da página |
| Micro-interações | **Motion** (Framer Motion) ou GSAP | Hover, cursor customizado, transições de página |
| 3D (quando tem) | **Three.js / React Three Fiber** | Objetos 3D girando, distorções WebGL |
| Vídeo de fundo | `<video autoplay muted loop playsinline>` | Heros com vídeo em loop |

### 2. Os efeitos clássicos desses reels e como se chamam

- **Hero com vídeo/imagem que encolhe ao rolar** → ScrollTrigger com `scrub` + `pin`
- **Texto que aparece letra por letra / linha por linha** → GSAP SplitText + stagger
- **Seção horizontal dentro do scroll vertical** → ScrollTrigger horizontal scroll
- **Imagens com parallax** → ScrollTrigger com `scrub` e velocidades diferentes
- **Números que contam sozinhos** → GSAP com snap/textContent
- **Cursor customizado que segue o mouse** → GSAP quickTo
- **Página que desliza suave, sem "trancos"** → Lenis smooth scroll
- **Cards que entram em cascata** → stagger reveal com ScrollTrigger

### 3. O fluxo de trabalho

1. **Referência**: salvar sites parecidos (awwwards.com, godly.website, lapa.ninja)
2. **Design**: definir tipografia grande, poucas cores, muito espaço em branco
3. **Estrutura**: montar o HTML/JSX das seções sem animação nenhuma
4. **Scroll suave**: adicionar Lenis
5. **Animações**: aplicar GSAP + ScrollTrigger seção por seção
6. **Performance**: animar só `transform` e `opacity`, mirar 60fps
7. **Deploy**: Vercel, Netlify ou Cloudflare Pages (grátis)

## Skills instaladas neste repositório

Em `.claude/skills/` estão instaladas as skills que ensinam o Claude Code a
construir exatamente esse tipo de site:

| Skill | Origem | O que ensina |
|---|---|---|
| `gsap-core` | Oficial GSAP | Fundamentos de tweens, easings, seletores |
| `gsap-scrolltrigger` | Oficial GSAP | Parallax, pin, scrub, animações por scroll |
| `gsap-timeline` | Oficial GSAP | Sequências e coreografia de animações |
| `gsap-plugins` | Oficial GSAP | SplitText, Draggable, MotionPath etc. |
| `gsap-performance` | Oficial GSAP | Manter tudo a 60fps |
| `gsap-react` | Oficial GSAP | GSAP dentro do React (useGSAP) |
| `gsap-frameworks` | Oficial GSAP | GSAP com Next.js, Vue, Svelte |
| `gsap-utils` | Oficial GSAP | Utilitários (mapRange, interpolate...) |
| `awwwards-animations` | devmartinese | Padrões completos nível Awwwards: Lenis, cursors, transições, texto cinético, arte generativa |

Com as skills instaladas, basta pedir ao Claude Code, por exemplo:

> "Crie um hero com vídeo de fundo, texto que se revela linha por linha e
> uma seção de projetos com scroll horizontal e parallax"

e ele seguirá os padrões profissionais dessas skills.

## Fontes das skills

- https://github.com/greensock/gsap-skills (oficial da GSAP)
- https://github.com/devmartinese/awwwards-animations-skill
- Diretório de skills: https://agenticskills.io/skills
