(() => {
  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canHover =
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const root = document.querySelector(".page");
  if (!root) return;

  const SKIP_SELECTOR = "script, style, textarea, input, code, pre";

  function shouldSkipTextNode(node) {
    if (!node || !node.nodeValue) return true;
    if (!node.nodeValue.trim()) return true;
    const parent = node.parentElement;
    if (!parent) return true;
    if (parent.closest(SKIP_SELECTOR)) return true;
    if (parent.closest("[data-no-fish]")) return true;
    return false;
  }

  function wrapTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return;

    const text = node.nodeValue;
    const isSimple =
      parent.childNodes.length === 1 &&
      parent.children.length === 0 &&
      !parent.hasAttribute("data-fish-labeled");

    if (isSimple) {
      parent.setAttribute("aria-label", parent.textContent || "");
      parent.setAttribute("data-fish-labeled", "1");
    }

    const frag = document.createDocumentFragment();

    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];

      if (ch === " " || ch === "\n" || ch === "\t") {
        frag.appendChild(document.createTextNode(ch));
        continue;
      }

      const span = document.createElement("span");
      span.className = "ch";
      span.textContent = ch;

      if (isSimple) {
        span.setAttribute("aria-hidden", "true");
      }

      frag.appendChild(span);
    }

    parent.replaceChild(frag, node);
  }

  // Wrap visible text nodes into spans
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(wrapTextNode);

  const letters = Array.from(root.querySelectorAll(".ch"));
  const nameEl = root.querySelector(".name");

  // Fish movement state (in page coordinates)
  const items = letters.map((el) => ({
    el,
    x0: 0,
    y0: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  }));

  function measureAll() {
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      it.x0 = r.left + window.scrollX + r.width / 2;
      it.y0 = r.top + window.scrollY + r.height / 2;
    }
  }

  const mouse = {
    x: -1e9,
    y: -1e9,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0,
    lastT: performance.now(),
  };

  function onPointerMove(e) {
    const x = e.clientX + window.scrollX;
    const y = e.clientY + window.scrollY;

    const now = performance.now();
    const dt = Math.max(12, Math.min(40, now - mouse.lastT));

    // px per ms
    const vx = (x - mouse.lastX) / dt;
    const vy = (y - mouse.lastY) / dt;

    mouse.vx = vx;
    mouse.vy = vy;
    mouse.x = x;
    mouse.y = y;

    mouse.lastX = x;
    mouse.lastY = y;
    mouse.lastT = now;
  }

  function onPointerLeave() {
    mouse.x = -1e9;
    mouse.y = -1e9;
    mouse.vx = 0;
    mouse.vy = 0;
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("blur", onPointerLeave);
  document.addEventListener("mouseleave", onPointerLeave);

  window.addEventListener(
    "resize",
    () => {
      for (const it of items) {
        it.x = 0;
        it.y = 0;
        it.vx = 0;
        it.vy = 0;
        it.el.style.transform = "";
      }
      measureAll();
    },
    { passive: true }
  );

  requestAnimationFrame(() => {
    measureAll();
  });
  window.addEventListener("load", measureAll, { once: true });

  // Re-measure if fonts/images change layout.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measureAll).catch(() => {});
  }

  const imgs = Array.from(root.querySelectorAll("img"));
  for (const img of imgs) {
    if (img.complete) continue;
    img.addEventListener("load", measureAll, { once: true });
  }

  if (reduceMotion || !canHover) {
    if (nameEl) nameEl.style.setProperty("--gshift", "0");
    return;
  }

  // Calm, smooth repulsion.
  const RADIUS = 92;
  const PUSH = 16;
  const MAX_OFFSET = 10;
  const EASE = 0.07;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function tick(now) {
    // Name gradient shift (px). Smooth.
    if (nameEl) {
      const gshift = (now * 0.05) % 2000;
      nameEl.style.setProperty("--gshift", gshift.toFixed(2));
    }

    for (const it of items) {
      let tx = 0;
      let ty = 0;

      // Use the original letter position for distance.
      const dx = it.x0 - mouse.x;
      const dy = it.y0 - mouse.y;
      const d = Math.hypot(dx, dy);

      if (d < RADIUS) {
        const t = 1 - d / RADIUS;
        // Smooth falloff so far letters barely move.
        const s = t * t * t;
        const inv = 1 / (d + 0.001);

        tx = (dx * inv) * (s * PUSH);
        ty = (dy * inv) * (s * (PUSH * 0.78));
      }

      it.x = clamp(it.x + (tx - it.x) * EASE, -MAX_OFFSET, MAX_OFFSET);
      it.y = clamp(it.y + (ty - it.y) * EASE, -MAX_OFFSET, MAX_OFFSET);

      it.el.style.transform = `translate3d(${it.x.toFixed(2)}px, ${it.y.toFixed(2)}px, 0)`;
    }

    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
})();
