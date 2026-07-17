/* ── LANGUAGE ── */
function setLang(l) {
  document.documentElement.lang = l;
  try {
    localStorage.setItem("iberia-lang", l);
  } catch (e) {}
  var ka = document.getElementById("b-ka"),
    en = document.getElementById("b-en");
  if (ka) ka.classList.toggle("on", l === "ka");
  if (en) en.classList.toggle("on", l === "en");
}
(function () {
  var saved = "ka";
  try {
    saved = localStorage.getItem("iberia-lang") || "ka";
  } catch (e) {}
  document.addEventListener("DOMContentLoaded", function () {
    setLang(saved);
  });
})();

/* ── NAV ── */
document.addEventListener("DOMContentLoaded", function () {
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var links = document.getElementById("links");
  if (burger && links)
    burger.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  var here = location.pathname.split("/").pop() || "index.html";

  /* Pages with a hero (home) carry data-veil: the menu stays hidden
     until the visitor scrolls, so the opening frame stays clean. */
  var veils = nav && nav.hasAttribute("data-veil");
  if (veils && window.scrollY < 80) nav.classList.add("veiled");

  window.addEventListener(
    "scroll",
    function () {
      if (!nav) return;
      nav.classList.toggle("stuck", window.scrollY > 40);
      if (veils) nav.classList.toggle("veiled", window.scrollY < 80);
    },
    { passive: true },
  );

  document.querySelectorAll("#links a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.classList.add("active");
  });

  /* reveal */
  var io = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("in");
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach(function (el) {
    io.observe(el);
  });

  /* reticle */
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    var ret = document.getElementById("reticle");
    if (ret) {
      document.body.classList.add("reticle-on");
      var rx = 0,
        ry = 0,
        cx = 0,
        cy = 0;
      document.addEventListener("mousemove", function (e) {
        rx = e.clientX;
        ry = e.clientY;
        ret.classList.add("live");
      });
      (function loop() {
        cx += (rx - cx) * 0.22;
        cy += (ry - cy) * 0.22;
        ret.style.left = cx + "px";
        ret.style.top = cy + "px";
        requestAnimationFrame(loop);
      })();
      document
        .querySelectorAll("a,button,input,select,textarea,.card,.ph")
        .forEach(function (el) {
          el.addEventListener("mouseenter", function () {
            ret.classList.add("hot");
          });
          el.addEventListener("mouseleave", function () {
            ret.classList.remove("hot");
          });
        });
    }
  }
});

/* ── REGISTRATION DASHBOARD ── */
/* DEMO DATA — in production this list comes from the club database via an API call.
   Adding a club in the admin panel makes it appear here automatically. */
var CLUB_DB = [
  { id: "iberia", ka: "იბერია", en: "Iberia" },
  { id: "kolkheti", ka: "კოლხეთი", en: "Kolkheti" },
  { id: "kartli", ka: "ქართლის მონადირეები", en: "Kartli Hunters" },
  { id: "tusheti", ka: "თუშეთის კლუბი", en: "Tusheti Club" },
  { id: "kakheti", ka: "კახეთის სამონადირეო", en: "Kakheti Hunting Society" },
  { id: "other", ka: "სხვა — ჩაწერეთ ქვემოთ", en: "Other — type below" },
];

function loadClubs() {
  var sel = document.getElementById("club-select");
  if (!sel) return;
  sel.innerHTML =
    '<option value="" data-ka>იტვირთება…</option><option value="" data-en>Loading…</option>';
  /* simulated DB latency */
  setTimeout(function () {
    var html =
      '<option value="" data-ka>აირჩიეთ კლუბი…</option><option value="" data-en>Select your club…</option>';
    CLUB_DB.forEach(function (c) {
      html += '<option value="' + c.id + '" data-ka>' + c.ka + "</option>";
      html += '<option value="' + c.id + '" data-en>' + c.en + "</option>";
    });
    sel.innerHTML = html;
    setLang(document.documentElement.lang);
  }, 500);
}

function affil(kind) {
  var club = document.getElementById("c-club");
  var solo = document.getElementById("c-solo");
  if (club) club.classList.toggle("open", kind === "club");
  if (solo) solo.classList.toggle("open", kind === "solo");
  document.querySelectorAll(".step").forEach(function (s, i) {
    s.classList.toggle("on", i <= 1);
  });
  if (kind === "club") loadClubs();
}

function submitReg() {
  var form = document.getElementById("reg-form");
  var ok = document.getElementById("reg-ok");
  if (form) form.style.display = "none";
  if (ok) ok.classList.add("show");
  document.querySelectorAll(".step").forEach(function (s) {
    s.classList.add("on");
  });
  return false;
}
