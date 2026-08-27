/* 3S cosmic intro — indigo sky, shamrock motes, three heart-leaves assemble
   into the real studio mark. Not a forest. Not black. */
(function () {
  const cosmos = document.getElementById("cosmos");
  if (!cosmos) {
    document.body.classList.add("studio-open");
    return;
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 720px)").matches || matchMedia("(pointer: coarse)").matches;
  const skipRequested =
    reduce ||
    location.hash === "#studio" ||
    sessionStorage.getItem("3s-enter") === "1";

  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d", { alpha: false });
  const cursor = document.getElementById("cursor");
  const heart = document.getElementById("heart-mark");
  const plate = document.getElementById("intro-plate");
  const enter = document.getElementById("enter");
  const hint = document.getElementById("hint");
  const wipe = document.getElementById("wipe");

  let W, H, cx, cy, raf;
  let mouse = { x: -9999, y: -9999 };
  let state = "idle"; // idle | near | bloom | out
  let bloomTimer = null;
  let hintTimer = null;
  let stars = [];
  let motes = [];

  function resize() {
    W = canvas.width = innerWidth * devicePixelRatio;
    H = canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    cx = innerWidth / 2;
    cy = innerHeight / 2;
    seed();
  }

  function seed() {
    const nStars = mobile ? 70 : 140;
    const nMotes = mobile ? 22 : 42;
    stars = Array.from({ length: nStars }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.6 + 0.15,
      tw: Math.random() * 2 + 0.4,
      ph: Math.random() * Math.PI * 2,
      indigo: Math.random() > 0.72,
    }));
    motes = Array.from({ length: nMotes }, () => ({
      x: Math.random() * innerWidth,
      y: innerHeight * 0.08 + Math.random() * innerHeight * 0.8,
      r: Math.random() * 1.8 + 0.7,
      sp: 0.18 + Math.random() * 0.45,
      ang: Math.random() * Math.PI * 2,
      turn: (Math.random() - 0.5) * 0.028,
      ph: Math.random() * Math.PI * 2,
      pulse: 0.5 + Math.random() * 1.1,
      hue: Math.random() > 0.18 ? "green" : "indigo",
    }));
  }

  function nebula() {
    const g = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy, Math.max(innerWidth, innerHeight) * 0.75);
    g.addColorStop(0, "#1d1c42");
    g.addColorStop(0.45, "#16143a");
    g.addColorStop(1, "#0d111a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    const blob = (x, y, r, c) => {
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, c);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    blob(innerWidth * 0.18, innerHeight * 0.22, innerWidth * 0.38, "rgba(95,79,204,0.22)");
    blob(innerWidth * 0.82, innerHeight * 0.7, innerWidth * 0.42, "rgba(24,137,91,0.14)");
    blob(cx, cy, innerWidth * 0.22, "rgba(82,204,122,0.08)");
  }

  function drawStars(t) {
    stars.forEach((s) => {
      const tw = s.a * (0.55 + 0.45 * Math.abs(Math.sin(t * 0.001 * s.tw + s.ph)));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.indigo
        ? `rgba(154,142,228,${tw})`
        : `rgba(232,231,234,${tw})`;
      ctx.fill();
    });
  }

  function drawMotes(t) {
    motes.forEach((m) => {
      m.ang += m.turn + Math.sin(t * 0.0003 + m.ph) * 0.018;
      m.x += Math.cos(m.ang) * m.sp;
      m.y += Math.sin(m.ang) * m.sp * 0.55;
      if (m.x < -24) m.x = innerWidth + 24;
      if (m.x > innerWidth + 24) m.x = -24;
      if (m.y < innerHeight * 0.04) m.y = innerHeight * 0.04;
      if (m.y > innerHeight * 0.92) m.y = innerHeight * 0.92;
      const b = 0.35 + 0.65 * Math.abs(Math.sin(t * m.pulse * 0.001 + m.ph));
      const col = m.hue === "green"
        ? [124, 252, 144]
        : [154, 142, 228];
      const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 9);
      glow.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${b * 0.85})`);
      glow.addColorStop(0.35, `rgba(${col[0]},${col[1]},${col[2]},${b * 0.22})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(232,255,220,${b})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function lantern() {
    if (mouse.x < 0 || state === "out") return;
    const r = 170;
    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, r);
    g.addColorStop(0, "rgba(124,252,144,0.12)");
    g.addColorStop(0.4, "rgba(82,204,122,0.05)");
    g.addColorStop(1, "rgba(95,79,204,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function heartGlow() {
    if (state === "out") return;
    const dx = mouse.x - cx;
    const dy = mouse.y - cy;
    const dist = Math.hypot(dx, dy);
    const max = Math.min(innerWidth, innerHeight) * 0.32;
    if (dist > max && state === "idle") return;
    const i = Math.max(0, 1 - dist / max);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, max);
    g.addColorStop(0, `rgba(82,204,122,${0.16 * (state === "bloom" ? 1 : i)})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, max, 0, Math.PI * 2);
    ctx.fill();
  }

  function proximity() {
    if (state === "bloom" || state === "out") return;
    const dist = Math.hypot(mouse.x - cx, mouse.y - cy);
    const near = Math.min(innerWidth, innerHeight) * 0.16;
    if (dist < near * 1.7) {
      heart.classList.add("is-near");
      state = dist < near ? "near" : "idle";
    } else {
      heart.classList.remove("is-near");
      state = "idle";
    }
    if (state === "near") {
      if (!bloomTimer) bloomTimer = setTimeout(bloom, 520);
    } else if (bloomTimer) {
      clearTimeout(bloomTimer);
      bloomTimer = null;
    }
  }

  function bloom() {
    if (state === "bloom" || state === "out") return;
    state = "bloom";
    heart.classList.add("is-near", "is-bloom");
    const real = document.getElementById("real-mark");
    setTimeout(() => {
      heart.classList.add("is-done");
      real?.classList.add("show");
    }, 380);
    plate.classList.add("show");
    setTimeout(() => enter.classList.add("show"), 280);
    hint.classList.remove("show");
  }

  function openStudio() {
    if (state === "out") return;
    state = "out";
    sessionStorage.setItem("3s-enter", "1");
    wipe.classList.add("go");
    cosmos.classList.add("exiting");
    setTimeout(() => {
      document.body.classList.add("studio-open");
      document.documentElement.style.cursor = "auto";
      cosmos.remove();
      wipe.remove();
      window.dispatchEvent(new Event("3s:entered"));
    }, 880);
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    nebula();
    drawStars(t);
    heartGlow();
    drawMotes(t);
    lantern();
    if (state !== "bloom" && state !== "out") proximity();
  }

  function onMove(x, y) {
    mouse.x = x;
    mouse.y = y;
    if (cursor && !mobile) {
      cursor.style.opacity = "1";
      cursor.style.transform = `translate(${x}px,${y}px)`;
    }
    if (state === "idle") {
      clearTimeout(hintTimer);
      hint.classList.remove("show");
      hintTimer = setTimeout(() => {
        if (state !== "bloom" && state !== "out") hint.classList.add("show");
      }, 1800);
    }
  }

  if (skipRequested) {
    document.body.classList.add("studio-open");
    cosmos.remove();
    if (wipe) wipe.remove();
    return;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
    if (cursor) cursor.style.display = "none";
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });
  canvas.addEventListener("click", () => {
    if (state === "out") return;
    if (state === "bloom") openStudio();
    else bloom();
  });
  enter.addEventListener("click", openStudio);
  document.getElementById("skip-intro")?.addEventListener("click", openStudio);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (state !== "bloom") bloom();
      else openStudio();
    }
    if (e.key === "Escape") openStudio();
  });

  resize();
  loop(0);
  setTimeout(() => { if (state === "idle") hint.classList.add("show"); }, 2200);
  if (mobile) setTimeout(() => { if (state !== "out") bloom(); }, 2400);
})();
