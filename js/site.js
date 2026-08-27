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
    const open = document.body.classList.contains("studio-open") || document.body.classList.contains("page");
    nav.classList.toggle("is-solid", open && y > 8);
  }
  window.addEventListener("scroll", solidNav, { passive: true });
  window.addEventListener("3s:entered", solidNav);
  solidNav();

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle?.addEventListener("click", () => setDrawer(true));
  close?.addEventListener("click", () => setDrawer(false));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));

  const live = document.querySelector("[data-live]");
  if (live) {
    live.querySelectorAll("[data-brand-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        live.setAttribute("data-brand", btn.getAttribute("data-brand-set"));
        live.querySelectorAll("[data-brand-set]").forEach((b) => b.classList.toggle("is-on", b === btn));
      });
    });
  }

  if (!matchMedia("(pointer: fine)").matches) document.documentElement.classList.add("no-hover");
})();
