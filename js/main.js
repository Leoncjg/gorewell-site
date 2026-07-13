/* Gorewell Ltd — shared site JS (vanilla, no dependencies) */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 4);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Hamburger menu ---------- */
  var burger = document.getElementById("hamburger");
  var nav = document.getElementById("mainNav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Dotted world map ----------
     Coarse equirectangular world encoded as a character grid:
     '#' = land dot. Rendered into any <svg class="dotmap"> element.
     data-arcs="true" adds animated arcs from the UK to global hubs. */
  var MAP = [
    "                     #####          ##        ## ## # ##  #      ",
    "      # ########     ######        ####    ######################",
    "  ## ###############  #####        ####   ####################   ",
    "  #################    ###         ###   #####################   ",
    "     ##############            ##  #### ######################   ",
    "      #############            ##  ########################      ",
    "        ###########            ############################      ",
    "        ##########             ###########################       ",
    "        #########             ### ########################  ##   ",
    "         ########            ###############################  #  ",
    "          ######             ################## ###########  ##  ",
    "           ####              ###############  ####  #######      ",
    "            ####             ##############   ####   ## ###      ",
    "             ####            #############    ###     ######     ",
    "              ####           ############     ##      ## ####    ",
    "                  ######      ###########     #      ######## #  ",
    "                 ########     ###########           ###########  ",
    "                 #########    ##########            ############ ",
    "                 ##########    #########             ##### ######",
    "                 ##########    ########                #######   ",
    "                 #########      #######              #########   ",
    "                 #########      #######             ##########   ",
    "                 ########       ######              ##########   ",
    "                 #######         #####              ##########   ",
    "                 ######          ####                ########    ",
    "                 #####            #                    ####   ## ",
    "                 ####                                   #     ## ",
    "                 ###                                          #  ",
    "                 ###                                             ",
    "                  #                                              "
  ];

  var CELL = 12;
  var SVGNS = "http://www.w3.org/2000/svg";

  /* Hub positions as [col, row] on the grid above. UK is the origin. */
  var UK = [32, 5];
  var HUBS = [
    [19, 8],   // North America
    [23, 18],  // South America
    [43, 11],  // Middle East
    [55, 9],   // Asia
    [59, 23]   // Australia
  ];

  function cellXY(c) {
    return [c[0] * CELL + CELL / 2, c[1] * CELL + CELL / 2];
  }

  function el(name, attrs) {
    var node = document.createElementNS(SVGNS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function renderDotMap(svg) {
    var w = MAP[0].length * CELL;
    var h = MAP.length * CELL;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    var dots = el("g", {});
    for (var r = 0; r < MAP.length; r++) {
      for (var c = 0; c < MAP[r].length; c++) {
        if (MAP[r].charAt(c) !== "#") continue;
        var d = el("circle", {
          class: "dot",
          cx: c * CELL + CELL / 2,
          cy: r * CELL + CELL / 2,
          r: 2.4
        });
        /* slight organic variation */
        if ((r * 31 + c * 17) % 5 === 0) d.setAttribute("opacity", ".3");
        dots.appendChild(d);
      }
    }
    svg.appendChild(dots);

    if (svg.getAttribute("data-arcs") !== "true") return;

    var o = cellXY(UK);
    HUBS.forEach(function (hub, i) {
      var t = cellXY(hub);
      var mx = (o[0] + t[0]) / 2;
      var my = (o[1] + t[1]) / 2;
      var dist = Math.hypot(t[0] - o[0], t[1] - o[1]);
      var d = "M " + o[0] + " " + o[1] +
              " Q " + mx + " " + Math.max(6, my - (dist * 0.32 + 22)) +
              " " + t[0] + " " + t[1];
      var path = el("path", { class: "arc", d: d });
      svg.appendChild(path);
      var len = path.getTotalLength();
      path.style.setProperty("--len", len);
      if (!reducedMotion) {
        path.style.animationDelay = (0.25 + i * 0.28) + "s";
        /* "Shipment" dot travelling along the arc (SMIL, loops forever) */
        var packet = el("circle", { class: "packet", r: 2.6 });
        var motion = el("animateMotion", {
          dur: (3.6 + i * 0.5) + "s",
          begin: (0.6 + i * 0.28) + "s",
          repeatCount: "indefinite",
          path: d,
          calcMode: "spline",
          keySplines: "0.4 0 0.6 1",
          keyTimes: "0;1",
          keyPoints: "0;1"
        });
        var fade = el("animate", {
          attributeName: "opacity",
          values: "0;1;1;0",
          keyTimes: "0;0.1;0.85;1",
          dur: (3.6 + i * 0.5) + "s",
          begin: (0.6 + i * 0.28) + "s",
          repeatCount: "indefinite"
        });
        packet.setAttribute("opacity", "0");
        packet.appendChild(motion);
        packet.appendChild(fade);
        svg.appendChild(packet);
      }

      var ring = el("circle", { class: "hub-ring", cx: t[0], cy: t[1], r: 7 });
      if (!reducedMotion) ring.style.animationDelay = (i * 0.45) + "s";
      svg.appendChild(ring);
      svg.appendChild(el("circle", { class: "hub", cx: t[0], cy: t[1], r: 3.4 }));
    });

    svg.appendChild(el("circle", { class: "hub-ring", cx: o[0], cy: o[1], r: 8 }));
    svg.appendChild(el("circle", { class: "hub-origin", cx: o[0], cy: o[1], r: 4.2 }));
  }

  document.querySelectorAll("svg.dotmap").forEach(renderDotMap);

  /* ---------- Stat count-up on scroll into view ---------- */
  var stats = document.querySelectorAll("[data-count]");
  if (stats.length) {
    var animate = function (node) {
      var target = parseInt(node.getAttribute("data-count"), 10);
      var suffix = node.getAttribute("data-suffix") || "";
      if (reducedMotion || !("IntersectionObserver" in window)) {
        node.textContent = target + suffix;
        return;
      }
      var dur = 1400;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (reducedMotion || !("IntersectionObserver" in window)) {
      stats.forEach(animate);
    } else {
      var seen = new WeakSet();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !seen.has(entry.target)) {
            seen.add(entry.target);
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      stats.forEach(function (s) { io.observe(s); });
    }
  }

  /* ---------- Scroll reveal (staggered per sibling group) ---------- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("revealed"); });
    } else {
      reveals.forEach(function (el) {
        var siblings = el.parentElement.querySelectorAll(":scope > [data-reveal]");
        var idx = Array.prototype.indexOf.call(siblings, el);
        if (idx > 0) el.style.setProperty("--reveal-delay", (idx * 0.09) + "s");
      });
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            rio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      reveals.forEach(function (el) { rio.observe(el); });
    }
  }

  /* ---------- Scroll progress bar ---------- */
  if (header && !reducedMotion) {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    header.appendChild(bar);
    var barTick = false;
    var updateBar = function () {
      barTick = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
    };
    window.addEventListener("scroll", function () {
      if (!barTick) { barTick = true; requestAnimationFrame(updateBar); }
    }, { passive: true });
    updateBar();
  }

  /* ---------- FAQ smooth open/close ---------- */
  document.querySelectorAll("details.faq-item").forEach(function (item) {
    var summary = item.querySelector("summary");
    var answer = item.querySelector(".faq-a");
    if (!summary || !answer || reducedMotion || !answer.animate) return;
    answer.style.overflow = "hidden";
    var animating = false;
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (animating) return;
      animating = true;
      var openKF = { height: "0px", paddingBottom: "0px", opacity: 0 };
      if (item.open) {
        var closedKF = { height: answer.offsetHeight + "px", paddingBottom: "20px", opacity: 1 };
        var closing = answer.animate([closedKF, openKF], { duration: 260, easing: "ease" });
        closing.onfinish = function () { item.open = false; animating = false; };
      } else {
        item.open = true;
        var h = answer.offsetHeight;
        var opening = answer.animate(
          [openKF, { height: h + "px", paddingBottom: "20px", opacity: 1 }],
          { duration: 300, easing: "ease" }
        );
        opening.onfinish = function () { animating = false; };
      }
    });
  });

  /* ---------- Contact form (mailto fallback) ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (id) { var el = document.getElementById(id); return el ? (el.value || "").trim() : ""; };
      /* Sales handles orders, wholesale & price lists; Info handles everything else */
      var recipient = get("cf-topic") === "sales" ? "sales@gorewell.com" : "info@gorewell.com";
      var subject = "Website enquiry from " + (get("cf-name") || "the Gorewell website");
      var body =
        "Name: " + get("cf-name") + "\n" +
        "Company: " + get("cf-company") + "\n" +
        "Email: " + get("cf-email") + "\n\n" +
        get("cf-message");
      window.location.href =
        "mailto:" + recipient +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }
})();
