/* Plant reveal — lantern on the real 3Shamrocks plants. Wordmark once. */
(function () {
  const cosmos = document.getElementById("cosmos");
  if (!cosmos) {
    document.body.classList.add("studio-open");
    return;
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 720px)").matches || matchMedia("(pointer: coarse)").matches;
  const skip =
    reduce ||
    location.hash === "#studio" ||
    sessionStorage.getItem("3s-enter-v3") === "1";

  const canvas = document.getElementById("veil");
  const ctx = canvas.getContext("2d");
  const cursor = document.getElementById("cursor");
  const plate = document.getElementById("intro-plate");
  const enter = document.getElementById("enter");
  const hint = document.getElementById("hint");
  const wipe = document.getElementById("wipe");

  let W, H, cx, cy, raf;
  let mouse = { x: -1, y: -1 };
  let state = "idle";
  let bloomTimer = null;
  let hintTimer = null;
  let radius = 0;

  function resize() {
    W = canvas.width = innerWidth * devicePixelRatio;
    H = canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    cx = innerWidth / 2;
    cy = innerHeight / 2;
  }

  function draw() {
    raf = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (state === "out") return;

    const cover = state === "bloom" ? 0.15 : 0.88;
    ctx.fillStyle = `rgba(10, 14, 22, ${cover})`;
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    if (mouse.x < 0 && state !== "bloom") return;

    const target = state === "bloom" ? Math.max(innerWidth, innerHeight) * 0.9 : 170;
    radius += (target - radius) * 0.08;

    const x = state === "bloom" ? cx : mouse.x;
    const y = state === "bloom" ? cy : mouse.y;
    const g = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
    g.addColorStop(0, "rgba(10,14,22,1)");
    g.addColorStop(0.65, "rgba(10,14,22,0.55)");
    g.addColorStop(1, "rgba(10,14,22,0)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  function proximity() {
    if (state === "bloom" || state === "out" || mouse.x < 0) return;
    const dist = Math.hypot(mouse.x - cx, mouse.y - cy);
    const near = Math.min(innerWidth, innerHeight) * 0.18;
    if (dist < near) {
      if (!bloomTimer) bloomTimer = setTimeout(bloom, 480);
    } else if (bloomTimer) {
      clearTimeout(bloomTimer);
      bloomTimer = null;
    }
  }

  function bloom() {
    if (state === "bloom" || state === "out") return;
    state = "bloom";
    plate.classList.add("show");
    setTimeout(() => enter.classList.add("show"), 280);
    hint.classList.remove("show");
  }

  function openStudio() {
    if (state === "out") return;
    state = "out";
    sessionStorage.setItem("3s-enter-v3", "1");
    wipe.classList.add("go");
    setTimeout(() => {
      document.body.classList.add("studio-open");
      cosmos.remove();
      wipe.remove();
      window.dispatchEvent(new Event("3s:entered"));
    }, 880);
  }

  function onMove(x, y) {
    mouse.x = x;
    mouse.y = y;
    if (cursor && !mobile) {
      cursor.style.opacity = "1";
      cursor.style.transform = `translate(${x}px,${y}px)`;
    }
    proximity();
    clearTimeout(hintTimer);
    hint.classList.remove("show");
    hintTimer = setTimeout(() => {
      if (state === "idle") hint.classList.add("show");
    }, 1600);
  }

  if (skip) {
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
  draw();
  setTimeout(() => { if (state === "idle") hint.classList.add("show"); }, 2000);
  if (mobile) setTimeout(() => { if (state !== "out") bloom(); }, 2200);
})();
