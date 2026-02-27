(() => {
  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canHover =
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const root = document.querySelector(".page");
  if (!root) return;

  // Skills: icon shatter + smooth label reveal
  const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const activeScrambles = new WeakMap();

  function scrambleTo(el, target, durationMs = 520) {
    if (!el) return;
    const prev = activeScrambles.get(el);
    if (prev) prev.cancel();

    const start = performance.now();
    const len = target.length;
    let raf = 0;

    const state = {
      cancel() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      },
    };
    activeScrambles.set(el, state);

    function step(now) {
      const t = Math.min(1, (now - start) / Math.max(200, durationMs));
      // Ease out for a clean finish.
      const eased = 1 - Math.pow(1 - t, 3);
      const reveal = Math.floor(eased * len);

      let out = "";
      for (let i = 0; i < len; i += 1) {
        if (i < reveal) {
          out += target[i];
        } else {
          const r = SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0];
          out += r;
        }
      }
      el.textContent = out;

      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    raf = requestAnimationFrame(step);
  }

  function initSkills() {
    const skills = Array.from(root.querySelectorAll(".skill"));
    if (!skills.length) return;

    for (const skill of skills) {
      const full = skill.getAttribute("data-full") || "";
      const icon = skill.getAttribute("data-icon") || "";
      const iconEl = skill.querySelector(".skill-icon");
      const textEl = skill.querySelector(".skill-text");

      if (iconEl && icon) {
        iconEl.style.setProperty("--img", `url('${icon}')`);
        if (!iconEl.querySelector(".shard")) {
          for (let i = 0; i < 6; i += 1) {
            const s = document.createElement("span");
            s.className = "shard";
            iconEl.appendChild(s);
          }
        }
      }

      if (textEl) textEl.textContent = "";

      const open = () => {
        skill.classList.add("is-open");
        if (!reduceMotion) scrambleTo(textEl, full, 520);
        else if (textEl) textEl.textContent = full;
      };

      const close = () => {
        skill.classList.remove("is-open");
        if (textEl) {
          const prev = activeScrambles.get(textEl);
          if (prev) prev.cancel();
          textEl.textContent = "";
        }
      };

      skill.addEventListener("mouseenter", open);
      skill.addEventListener("focus", open);
      skill.addEventListener("mouseleave", close);
      skill.addEventListener("blur", close);
    }
  }

  initSkills();

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

    // Tokenize by whitespace so we can prevent mid-word line breaks.
    const parts = text.split(/(\s+)/);

    for (const part of parts) {
      if (!part) continue;

      // Preserve whitespace exactly as-is so wrapping behaves naturally.
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }

      // Wrap each word/token to avoid letter-by-letter wrapping.
      const word = document.createElement("span");
      word.className = "w";
      if (isSimple) word.setAttribute("aria-hidden", "true");

      for (let i = 0; i < part.length; i += 1) {
        const ch = part[i];
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = ch;
        if (isSimple) span.setAttribute("aria-hidden", "true");
        word.appendChild(span);
      }

      frag.appendChild(word);
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
    const nameRect = nameEl ? nameEl.getBoundingClientRect() : null;
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      it.x0 = r.left + window.scrollX + r.width / 2;
      it.y0 = r.top + window.scrollY + r.height / 2;
    }

    // Align the gradient across the whole name by offsetting each character.
    if (nameEl && nameRect) {
      const nameChars = Array.from(nameEl.querySelectorAll(".ch"));
      for (const ch of nameChars) {
        const r = ch.getBoundingClientRect();
        const cx = r.left - nameRect.left;
        ch.style.setProperty("--cx", cx.toFixed(2));
      }
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
      const gshift = (now * 0.14) % 980;
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
