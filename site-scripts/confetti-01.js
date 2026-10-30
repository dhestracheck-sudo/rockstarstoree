// Confetti meledak tiap tambah keranjang. Canvas 1 lapis, rAF hanya saat ada partikel.
(function () {
  if (window.__rsConfetti) return;
  window.__rsConfetti = true;

  const COLORS = ["#ff7b1c", "#c084fc", "#ffd166", "#ff4d9d", "#2ecc71", "#6f8bff"];
  const MAX = 90;
  let canvas = null;
  let ctx = null;
  let parts = [];
  let rafId = 0;
  let lastX = window.innerWidth / 2;
  let lastY = window.innerHeight * 0.4;

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998;";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.scale(dpr, dpr);
  }

  document.addEventListener("pointerdown", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  }, { capture: true, passive: true });

  function burst(x, y) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ensureCanvas();
    const n = 26;
    for (let k = 0; k < n && parts.length < MAX; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 5;
      parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 3.2,
        w: 5 + Math.random() * 5,
        h: 3 + Math.random() * 4,
        r: Math.random() * Math.PI * 2,
        vr: -0.25 + Math.random() * 0.5,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1,
      });
    }
    if (!rafId) tick();
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    parts = parts.filter((p) => p.life > 0);
    if (!parts.length) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }
    for (const p of parts) {
      p.vy += 0.22;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life -= 0.016;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }

  function hook() {
    if (typeof window.flashAdd !== "function") {
      window.setTimeout(hook, 300);
      return;
    }
    if (window.flashAdd.__rsConfettiHooked) return;
    const orig = window.flashAdd;
    const wrapped = function (page, i, j) {
      let before = 0;
      try { before = (window.cart || []).length; } catch (e) {}
      const out = orig.apply(this, arguments);
      let after = before;
      try { after = (window.cart || []).length; } catch (e) {}
      if (after > before) burst(lastX, lastY);
      return out;
    };
    wrapped.__rsConfettiHooked = true;
    window.flashAdd = wrapped;
  }

  if (document.readyState === "complete" || document.readyState === "interactive") hook();
  else document.addEventListener("DOMContentLoaded", hook);
})();
