(function () {
  const nav = document.getElementById("nav");
  const drawer = document.getElementById("drawer");
  const toggle = document.getElementById("nav-toggle");
  const close = document.getElementById("drawer-close");

  function solidNav() {
    if (!nav) return;
    const y = window.scrollY;
    const caseHero = document.querySelector(".case-hero");
    if (caseHero) {
      if (y > 72) {
        nav.classList.remove("nav--cosmic");
        nav.classList.add("is-solid");
      } else {
        nav.classList.add("nav--cosmic");
        nav.classList.remove("is-solid");
      }
      return;
    }
    const studio = document.body.classList.contains("studio-open") || document.body.classList.contains("page");
    nav.classList.toggle("is-solid", studio && y > 12);
  }
  window.addEventListener("scroll", solidNav, { passive: true });
  window.addEventListener("3s:entered", () => {
    nav?.classList.remove("nav--cosmic");
    solidNav();
  });
  if (document.body.classList.contains("studio-open") && !document.querySelector(".case-hero")) {
    nav?.classList.remove("nav--cosmic");
  }
  if (document.body.classList.contains("page") && !document.querySelector(".case-hero")) {
    nav?.classList.remove("nav--cosmic");
  }
  solidNav();

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
    toggle?.setAttribute("aria-expanded", open ? "true" : "false");
  }
  toggle?.addEventListener("click", () => setDrawer(true));
  close?.addEventListener("click", () => setDrawer(false));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));

  /* live method switcher */
  const live = document.querySelector("[data-live]");
  if (live) {
    const buttons = live.querySelectorAll("[data-brand-set]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        live.setAttribute("data-brand", btn.getAttribute("data-brand-set"));
        buttons.forEach((b) => b.classList.toggle("is-on", b === btn));
      });
    });
  }

  /* magnetic buttons */
  if (matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  if (!matchMedia("(pointer: fine)").matches) {
    document.documentElement.classList.add("no-hover");
  }
})();
