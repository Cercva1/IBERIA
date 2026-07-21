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
        .querySelectorAll(
          "a,button,input,select,textarea,.card,.ph,.mem-link,.modal-x",
        )
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
    sel.onchange = function () {
      var other = document.getElementById("club-other");
      if (other) other.style.display = sel.value === "other" ? "" : "none";
    };
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

/* ── MEMBER PROFILE MODAL ── */
function openMem(card) {
  var mod = document.getElementById("mem-modal");
  if (!mod) return;
  document.getElementById("mm-photo").src = card.getAttribute("data-photo");
  document.getElementById("mm-photo").alt = card.getAttribute("data-name-en");
  document.getElementById("mm-name-ka").textContent =
    card.getAttribute("data-name-ka");
  document.getElementById("mm-name-en").textContent =
    card.getAttribute("data-name-en");
  var mail = card.getAttribute("data-mail"),
    fb = card.getAttribute("data-fb");
  document.getElementById("mm-mail").href = "mailto:" + mail;
  document.getElementById("mm-mail-note").textContent = mail;
  var fbBtn = document.getElementById("mm-fb");
  fbBtn.href = fb;
  fbBtn.style.display = fb && fb !== "#" ? "" : "none";
  mod.classList.add("open");
  document.body.classList.add("modal-open");
}
function closeMem() {
  var mod = document.getElementById("mem-modal");
  if (mod) mod.classList.remove("open");
  document.body.classList.remove("modal-open");
}
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".mem-link").forEach(function (card) {
    card.addEventListener("click", function () {
      openMem(card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMem(card);
      }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMem();
  });
});

/* ── STORY VIEWER (one photo at a time, arrows to move) ── */
var _vw = { photos: [], i: 0 };
function openViewer(el) {
  var mod = document.getElementById("story-viewer");
  if (!mod) return;
  _vw.photos = el.getAttribute("data-photos").split(",");
  _vw.i = 0;
  _vw.capKa = [];
  _vw.capEn = [];
  document.getElementById("vw-title-ka").textContent =
    el.getAttribute("data-title-ka");
  document.getElementById("vw-title-en").textContent =
    el.getAttribute("data-title-en");
  document.getElementById("vw-meta").textContent = el.getAttribute("data-meta");
  document.getElementById("vw-text-ka").textContent =
    el.getAttribute("data-text-ka");
  document.getElementById("vw-text-en").textContent =
    el.getAttribute("data-text-en");
  viewerShow();
  mod.classList.add("open");
  document.body.classList.add("modal-open");
}
function viewerShow() {
  var img = document.getElementById("vw-img");
  img.src = "assets/photos/" + _vw.photos[_vw.i];
  if (_vw.capKa && _vw.capKa.length) {
    document.getElementById("vw-title-ka").textContent = _vw.capKa[_vw.i];
    document.getElementById("vw-title-en").textContent = _vw.capEn[_vw.i];
  }
  document.getElementById("vw-count").textContent =
    _vw.i + 1 + " / " + _vw.photos.length;
  var one = _vw.photos.length < 2;
  document.querySelectorAll(".v-arrow").forEach(function (a) {
    a.style.display = one ? "none" : "";
  });
}
function viewerNav(d) {
  _vw.i = (_vw.i + d + _vw.photos.length) % _vw.photos.length;
  viewerShow();
}
function closeViewer() {
  var mod = document.getElementById("story-viewer");
  if (mod) mod.classList.remove("open");
  document.body.classList.remove("modal-open");
}
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".story-open").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openViewer(el);
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openViewer(el);
      }
    });
  });
  document.addEventListener("keydown", function (e) {
    var open = document.getElementById("story-viewer");
    if (!open || !open.classList.contains("open")) return;
    if (e.key === "ArrowLeft") viewerNav(-1);
    if (e.key === "ArrowRight") viewerNav(1);
    if (e.key === "Escape") closeViewer();
  });
});

/* ── GALLERY: filters + lightbox ── */
function galFilter(cat, btn) {
  document.querySelectorAll(".gal-filters .pill").forEach(function (p) {
    p.classList.remove("open");
  });
  if (btn) btn.classList.add("open");
  document.querySelectorAll(".gal-item").forEach(function (it) {
    it.style.display =
      cat === "all" || it.getAttribute("data-cat") === cat ? "" : "none";
  });
}
function visibleGalItems() {
  return Array.prototype.filter.call(
    document.querySelectorAll(".gal-item"),
    function (it) {
      return it.style.display !== "none";
    },
  );
}
document.addEventListener("DOMContentLoaded", function () {
  var items = document.querySelectorAll(".gal-item");
  if (!items.length) return;
  items.forEach(function (it) {
    it.addEventListener("click", function () {
      var vis = visibleGalItems();
      _vw.photos = vis.map(function (v) {
        return v.getAttribute("data-photo");
      });
      _vw.capKa = vis.map(function (v) {
        return v.getAttribute("data-cap-ka");
      });
      _vw.capEn = vis.map(function (v) {
        return v.getAttribute("data-cap-en");
      });
      _vw.i = vis.indexOf(it);
      document.getElementById("vw-meta").textContent = "";
      document.getElementById("vw-text-ka").textContent = "";
      document.getElementById("vw-text-en").textContent = "";
      viewerShow();
      document.getElementById("story-viewer").classList.add("open");
      document.body.classList.add("modal-open");
    });
  });
});
