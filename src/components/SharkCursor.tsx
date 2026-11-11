import { useEffect, useRef, useState } from "react";

const DIRECTION_WINDOW_MS = 80;
const MIN_DIRECTION_DISTANCE = 4;
const DIRECTION_DEADBAND = 26;
const POSITION_SMOOTHING_MS = 65;
const ANGLE_SMOOTHING_MS = 140;

type PointerSample = { x: number; y: number; time: number };

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function angleDifference(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}

export default function SharkCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !imageLoaded) return;
    const activeCursor = cursor;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    let samples: PointerSample[] = [];
    let targetX = 0;
    let targetY = 0;
    let targetAngle = 0;
    let currentX = 0;
    let currentY = 0;
    let currentAngle = 0;
    let hasPosition = false;
    let frame: number | null = null;
    let lastFrameTime = 0;

    function render() {
      activeCursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${currentAngle}deg)`;
    }

    function tick(now: number) {
      const elapsed = lastFrameTime === 0 ? 16 : Math.min(now - lastFrameTime, 50);
      lastFrameTime = now;
      const positionEase = 1 - Math.exp(-elapsed / POSITION_SMOOTHING_MS);
      const angleEase = 1 - Math.exp(-elapsed / ANGLE_SMOOTHING_MS);
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;
      const deltaAngle = angleDifference(currentAngle, targetAngle);

      if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1 && Math.abs(deltaAngle) < 0.1) {
        currentX = targetX;
        currentY = targetY;
        currentAngle = targetAngle;
        frame = null;
        render();
        return;
      }

      currentX += deltaX * positionEase;
      currentY += deltaY * positionEase;
      currentAngle = normalizeAngle(currentAngle + deltaAngle * angleEase);
      render();
      frame = requestAnimationFrame(tick);
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;

      const now = performance.now();
      while (samples.length && now - samples[0].time > DIRECTION_WINDOW_MS) samples.shift();
      samples.push({ x: event.clientX, y: event.clientY, time: now });

      if (samples.length > 1) {
        const first = samples[0];
        const deltaX = event.clientX - first.x;
        const deltaY = event.clientY - first.y;
        if (Math.hypot(deltaX, deltaY) >= MIN_DIRECTION_DISTANCE) {
          const direction = normalizeAngle((Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90);
          if (Math.abs(angleDifference(targetAngle, direction)) >= DIRECTION_DEADBAND) {
            targetAngle = direction;
          }
        }
      }

      targetX = event.clientX;
      targetY = event.clientY;
      if (!hasPosition) {
        currentX = targetX;
        currentY = targetY;
        hasPosition = true;
        render();
      }
      activeCursor.style.opacity = "1";
      document.documentElement.classList.add("has-shark-cursor");
      if (frame === null) {
        lastFrameTime = 0;
        frame = requestAnimationFrame(tick);
      }
    }

    function hide() {
      activeCursor.style.opacity = "0";
      samples = [];
      hasPosition = false;
      targetAngle = 0;
      currentAngle = 0;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastFrameTime = 0;
      document.documentElement.classList.remove("has-shark-cursor");
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("mouseleave", hide);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", hide);
      document.removeEventListener("mouseleave", hide);
      document.documentElement.classList.remove("has-shark-cursor");
    };
  }, [imageLoaded]);

  return (
    <div ref={cursorRef} className="shark-cursor" aria-hidden="true">
      <img
        src="/assets/shark-cursor.png"
        alt=""
        draggable={false}
        onLoad={() => setImageLoaded(true)}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}