import { useEffect, type RefObject } from "react";

type Letter = {
  el: HTMLElement;
  x0: number;
  y0: number;
  x: number;
  y: number;
  settled: boolean;
};

const RADIUS = 92;
const PUSH = 16;
const MAX_OFFSET = 10;
const EASE = 0.07;
const GRADIENT_SPEED = 0.14;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function useLetterRepel(
  containerRef: RefObject<HTMLElement | null>,
  nameRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const letters: Letter[] = Array.from(container.querySelectorAll<HTMLElement>(".ch")).map((el) => ({
      el,
      x0: 0,
      y0: 0,
      x: 0,
      y: 0,
      settled: true,
    }));

    let gradientMax = 0;
    let gradientPos = 0;
    let gradientDir = 1;

    function measure() {
      // document space, so scrolling never invalidates these
      for (const letter of letters) {
        const rect = letter.el.getBoundingClientRect();
        letter.x0 = rect.left + window.scrollX + rect.width / 2;
        letter.y0 = rect.top + window.scrollY + rect.height / 2;
      }

      const name = nameRef.current;
      if (!name) return;

      const nameRect = name.getBoundingClientRect();
      for (const char of name.querySelectorAll<HTMLElement>(".ch")) {
        const rect = char.getBoundingClientRect();
        char.style.setProperty("--cx", (rect.left - nameRect.left).toFixed(2));
      }

      const width = parseFloat(getComputedStyle(name).backgroundSize.split(" ")[0]);
      gradientMax = Number.isFinite(width) && width > 0 ? width : 1200;
    }

    measure();
    document.fonts?.ready.then(measure).catch(() => {});

    function reset() {
      for (const letter of letters) {
        letter.x = 0;
        letter.y = 0;
        letter.settled = true;
        letter.el.style.transform = "";
      }
      measure();
      gradientPos = Math.min(gradientPos, gradientMax);
    }

    window.addEventListener("resize", reset, { passive: true });

    if (reduceMotion || !canHover) {
      nameRef.current?.style.setProperty("--gshift", "0");
      return () => window.removeEventListener("resize", reset);
    }

    const pointer = { x: -1e9, y: -1e9 };

    function onMove(event: PointerEvent) {
      pointer.x = event.clientX + window.scrollX;
      pointer.y = event.clientY + window.scrollY;
    }

    function onAway() {
      pointer.x = -1e9;
      pointer.y = -1e9;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onAway);
    document.addEventListener("mouseleave", onAway);

    let frame = 0;
    let last = performance.now();

    function tick(now: number) {
      const name = nameRef.current;

      if (name && gradientMax > 0) {
        gradientPos += gradientDir * GRADIENT_SPEED * (now - last);
        if (gradientPos > gradientMax) {
          gradientPos = gradientMax;
          gradientDir = -1;
        } else if (gradientPos < 0) {
          gradientPos = 0;
          gradientDir = 1;
        }
        name.style.setProperty("--gshift", gradientPos.toFixed(2));
      }
      last = now;

      for (const letter of letters) {
        let tx = 0;
        let ty = 0;

        const dx = letter.x0 - pointer.x;
        const dy = letter.y0 - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < RADIUS) {
          const falloff = (1 - distance / RADIUS) ** 3;
          const inverse = 1 / (distance + 0.001);
          tx = dx * inverse * falloff * PUSH;
          ty = dy * inverse * falloff * PUSH * 0.78;
        }

        if (letter.settled && tx === 0 && ty === 0) continue;

        letter.x = clamp(letter.x + (tx - letter.x) * EASE, -MAX_OFFSET, MAX_OFFSET);
        letter.y = clamp(letter.y + (ty - letter.y) * EASE, -MAX_OFFSET, MAX_OFFSET);

        if (tx === 0 && ty === 0 && Math.abs(letter.x) < 0.02 && Math.abs(letter.y) < 0.02) {
          letter.x = 0;
          letter.y = 0;
          letter.settled = true;
          letter.el.style.transform = "";
          continue;
        }

        letter.settled = false;
        letter.el.style.transform = `translate3d(${letter.x.toFixed(2)}px, ${letter.y.toFixed(2)}px, 0)`;
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", reset);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onAway);
      document.removeEventListener("mouseleave", onAway);
    };
  }, [containerRef, nameRef]);
}
