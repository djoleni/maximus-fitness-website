(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const header = $(".header");
  const burger = $(".burger");
  const mobile = $(".mobile-nav");

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function (e) {
    var id = link.getAttribute("href");
    var target = id.length > 1 ? document.querySelector(id) : null;
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  });
  });

  if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  burger?.addEventListener("click", () => {
    const open = mobile.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".mobile-nav a").forEach((a) =>
    a.addEventListener("click", () => {
      mobile.classList.remove("is-open");
      document.body.style.overflow = "";
    })
  );

  const path = location.pathname.replace(/\/+$/, "") || "/";
  const onHome = /\/$|\/index\.html$/.test(path);
  const navLinks = $$(".nav a[href]");

  if (onHome) {
    // Homepage is one long page: follow scroll position so the underline
    // moves from Početna to Članarine / Galerija / Kontakt as those
    // sections come into view, instead of staying stuck on Početna.
    const homeLink = navLinks.find((a) => a.getAttribute("href") === "index.html");
    const spyTargets = navLinks
      .map((a) => {
        const href = a.getAttribute("href");
        const hash = href.includes("#") ? href.split("#")[1] : null;
        const el = hash && document.getElementById(hash);
        return el ? { link: a, el } : null;
      })
      .filter(Boolean);

    const updateActive = () => {
      const y = window.scrollY + 160;
      let active = homeLink;
      spyTargets.forEach(({ link, el }) => {
        if (el.offsetTop <= y) active = link;
      });
      navLinks.forEach((a) => a.classList.toggle("is-active", a === active));
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
  } else {
    // Location pages (detelinara.html, bulevar.html): highlight by filename.
    navLinks.forEach((a) => {
      const file = a.getAttribute("href").split("#")[0];
      if (file && path.endsWith("/" + file)) a.classList.add("is-active");
    });
  }

  function isOpenNow() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Belgrade",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const wd = get("weekday");
    const hour = Number(get("hour"));
    const min = Number(get("minute"));
    const t = hour * 60 + min;
    const weekend = wd === "Sat" || wd === "Sun";
    const open = weekend ? 8 * 60 : 6 * 60;
    const close = weekend ? 22 * 60 : 22 * 60 + 30;
    return t >= open && t < close;
  }

  $$("[data-live]").forEach((el) => {
    const open = isOpenNow();
    el.classList.toggle("is-closed", !open);
    const label = el.querySelector("[data-live-label]");
    if (label) label.textContent = open ? "Otvoreno sada" : "Trenutno zatvoreno";
  });

  const lb = $("#lightbox");
  const lbImg = lb?.querySelector("img");
  $$("[data-lb]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (!lb || !lbImg) return;
      lbImg.src = a.getAttribute("href");
      lbImg.alt = a.querySelector("img")?.alt || "";
      lb.classList.add("is-open");
    });
  });
  lb?.addEventListener("click", (e) => {
    if (e.target === lb || e.target.closest("[data-close]")) lb.classList.remove("is-open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lb?.classList.remove("is-open");
  });

  const form = $("#lead-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const loc = data.lokacija === "bulevar" ? "Bulevar" : "Detelinara";
    const phone = data.lokacija === "bulevar" ? "381628225676" : "381668116312";
    const text = [
      `Zdravo, Maximus ${loc}!`,
      `Ime: ${data.ime || ""}`,
      data.telefon ? `Telefon: ${data.telefon}` : "",
      data.poruka || "Zanima me članarina / probni trening.",
    ]
      .filter(Boolean)
      .join("\n");
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(text), "_blank");
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
})();
