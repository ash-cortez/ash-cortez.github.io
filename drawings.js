/* Hand-drawn sketches (rough.js) that trace themselves in as they scroll into view. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var O = { roughness: 1.25, bowing: 1.1, strokeWidth: 1.6, stroke: 'currentColor' };
  function o(extra) { var r = {}, k; for (k in O) r[k] = O[k]; for (k in extra || {}) r[k] = extra[k]; return r; }
  var HATCH = { fill: 'currentColor', fillStyle: 'hachure', hachureGap: 5, fillWeight: 1, hachureAngle: -41 };

  // Small deterministic random so the point cloud is the same on every load.
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  function text(svg, x, y, str) {
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('class', 'sk-label');
    t.textContent = str; svg.appendChild(t);
  }
  function dot(svg, x, y, r, cls) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', r);
    c.setAttribute('class', cls || 'sk-pt'); svg.appendChild(c);
  }

  var ART = {
    waymo: function (rc, add, svg) {
      add(rc.line(14, 226, 386, 226, o({ roughness: 0.7 })), 'faint');
      // lidar sweep
      add(rc.arc(225, 74, 130, 64, Math.PI * 1.06, Math.PI * 1.94, false, o({ strokeWidth: 1.2 })), 'accent');
      add(rc.arc(225, 74, 210, 104, Math.PI * 1.1, Math.PI * 1.9, false, o({ strokeWidth: 1.1 })), 'accent');
      add(rc.arc(225, 74, 300, 150, Math.PI * 1.14, Math.PI * 1.86, false, o({ strokeWidth: 1 })), 'accent faint');
      // body
      add(rc.path('M40,188 L44,160 Q50,146 76,141 L122,135 Q152,104 188,99 L262,99 Q298,102 328,134 L352,142 Q366,148 363,174 L360,188 L337,188 A37,37 0 0 0 263,188 L142,188 A37,37 0 0 0 68,188 Z', o()));
      add(rc.path('M138,134 Q162,110 192,106 L226,106 L226,134 Z', o()));
      add(rc.path('M234,106 L260,106 Q290,109 314,134 L234,134 Z', o()));
      add(rc.line(230, 138, 230, 184, o()));
      add(rc.line(242, 146, 258, 146, o()));
      add(rc.line(160, 146, 176, 146, o()));
      add(rc.path('M338,150 Q350,149 358,153', o()));
      add(rc.line(70, 162, 340, 166, o({ roughness: 1.6, strokeWidth: 1 })), 'faint');
      // sensors
      add(rc.rectangle(196, 92, 58, 7, o()));
      add(rc.rectangle(212, 72, 26, 20, o(HATCH)), 'accent');
      add(rc.ellipse(225, 72, 26, 9, o()));
      add(rc.rectangle(331, 127, 12, 9, o()));
      add(rc.rectangle(46, 148, 9, 10, o()));
      // wheels
      [105, 300].forEach(function (x) {
        add(rc.circle(x, 191, 60, o()));
        add(rc.circle(x, 191, 26, o()));
        add(rc.circle(x, 191, 6, o({ fill: 'currentColor', fillStyle: 'solid' })));
      });
    },

    bimanual: function (rc, add, svg) {
      add(rc.path('M50,214 L50,32 L350,32 L350,214', o({ roughness: 0.9 })), 'faint');
      add(rc.rectangle(186, 32, 28, 14, o()));
      add(rc.circle(200, 52, 9, o()), 'accent');
      add(rc.line(200, 58, 200, 180, o({ strokeWidth: 1, roughness: 0.6 })), 'accent faint dashed');
      add(rc.rectangle(26, 214, 348, 10, o()));
      add(rc.rectangle(192, 186, 16, 28, o(HATCH)), 'accent');
      function arm(m) {
        var X = function (x) { return m ? 400 - x : x; };
        add(rc.rectangle(m ? 400 - 136 : 80, 198, 56, 16, o()));
        add(rc.rectangle(m ? 400 - 122 : 94, 180, 28, 18, o()));
        add(rc.polygon([[X(102), 172], [X(114), 184], [X(158), 112], [X(146), 100]], o()));
        add(rc.circle(X(108), 178, 20, o()));
        add(rc.polygon([[X(157), 103], [X(147), 109], [X(185), 168], [X(195), 162]], o()));
        add(rc.circle(X(152), 106, 18, o()));
        add(rc.circle(X(190), 165, 13, o()));
        add(rc.line(X(186), 171, X(185), 196, o({ strokeWidth: 2 })));
        add(rc.line(X(192), 171, X(191), 198, o({ strokeWidth: 2 })));
      }
      arm(false); arm(true);
    },

    foxglove: function (rc, add, svg) {
      add(rc.rectangle(14, 12, 372, 236, o()));
      add(rc.line(14, 30, 386, 30, o()));
      [26, 38, 50].forEach(function (x) { add(rc.circle(x, 21, 6, o({ roughness: 0.6 }))); });
      // panels
      add(rc.rectangle(24, 38, 216, 172, o({ roughness: 0.9 })));
      add(rc.rectangle(248, 38, 128, 80, o({ roughness: 0.9 })));
      add(rc.rectangle(248, 126, 128, 84, o({ roughness: 0.9 })));
      text(svg, 30, 50, '3D'); text(svg, 254, 50, 'Plot'); text(svg, 254, 138, 'Image');
      // lidar rings
      var cx = 132, cy = 132;
      [20, 36, 52, 70, 88, 106].forEach(function (rx, k) {
        var ry = rx * 0.36, n = 26 + k * 10;
        for (var i = 0; i < n; i++) {
          var a = (i / n) * Math.PI * 2 + rnd() * 0.08;
          var x = cx + Math.cos(a) * rx * (0.97 + rnd() * 0.06), y = cy + Math.sin(a) * ry * (0.95 + rnd() * 0.1);
          if (x > 28 && x < 236 && y > 54 && y < 206) dot(svg, x, y, 1.1);
        }
      });
      // detected objects with dense returns
      [[58, 104, 24, 15], [178, 146, 28, 16], [196, 98, 20, 12], [86, 158, 22, 14]].forEach(function (b) {
        add(rc.rectangle(b[0], b[1], b[2], b[3], o({ strokeWidth: 1.3 })), 'accent');
        for (var i = 0; i < 14; i++) dot(svg, b[0] + 2 + rnd() * (b[2] - 4), b[1] + 2 + rnd() * (b[3] - 4), 1.1, 'sk-pt accent-pt');
      });
      add(rc.rectangle(125, 127, 15, 9, o(HATCH)), 'accent');
      // plot
      add(rc.line(256, 108, 368, 108, o({ roughness: 0.6 })), 'faint');
      add(rc.line(256, 58, 256, 108, o({ roughness: 0.6 })), 'faint');
      var pts = [];
      for (var x = 258; x <= 368; x += 8) pts.push([x, 86 + Math.sin((x - 258) / 11) * 14 + Math.sin((x - 258) / 4) * 3]);
      add(rc.curve(pts, o({ strokeWidth: 1.4 })), 'accent');
      // camera image: road in perspective
      add(rc.line(252, 172, 372, 168, o({ roughness: 0.8 })), 'faint');
      add(rc.line(300, 171, 260, 206, o()));
      add(rc.line(322, 170, 362, 206, o()));
      add(rc.line(311, 178, 311, 186, o({ strokeWidth: 1.2 })));
      add(rc.line(311, 194, 311, 204, o({ strokeWidth: 1.2 })));
      add(rc.rectangle(322, 176, 14, 10, o()), 'accent');
      // timeline
      add(rc.polygon([[26, 222], [26, 236], [37, 229]], o({ fill: 'currentColor', fillStyle: 'solid' })));
      add(rc.line(46, 229, 376, 229, o({ roughness: 0.6 })));
      add(rc.line(216, 220, 216, 238, o({ strokeWidth: 2 })), 'accent');
    },

    moab: function (rc, add, svg) {
      add(rc.ellipse(200, 236, 250, 22, o({ roughness: 0.6 })), 'faint');
      // base
      add(rc.path('M92,190 L92,214 A108,18 0 0 0 308,214 L308,190', o()));
      add(rc.ellipse(200, 190, 216, 36, o()));
      // center camera column
      add(rc.rectangle(188, 138, 24, 50, o()));
      add(rc.circle(200, 136, 13, o()), 'accent');
      // arms: servo, two links, joints
      [[0, 1], [1, -1]].forEach(function (p) {
        var s = p[1], bx = 200 - s * 70;
        add(rc.rectangle(bx - 12, 166, 24, 20, o()));
        add(rc.line(bx, 170, bx - s * 22, 146, o({ strokeWidth: 2.2 })));
        add(rc.line(bx - s * 22, 146, bx + s * 8, 112, o({ strokeWidth: 2.2 })));
        add(rc.circle(bx - s * 22, 146, 9, o()));
        add(rc.circle(bx + s * 8, 112, 8, o()));
      });
      add(rc.line(232, 176, 244, 146, o({ strokeWidth: 1.6 })), 'faint');
      add(rc.line(244, 146, 228, 116, o({ strokeWidth: 1.6 })), 'faint');
      // plate (tilted a little) and edge thickness
      add(rc.ellipse(200, 102, 252, 50, o()));
      add(rc.path('M74,102 L75,109 A126,25 0 0 0 325,109 L326,102', o()));
      add(rc.ellipse(200, 102, 30, 7, o({ roughness: 0.6 })), 'faint');
      // ball + motion
      add(rc.ellipse(244, 96, 36, 8, o({ roughness: 0.6 })), 'faint');
      add(rc.circle(244, 76, 34, o(HATCH)), 'accent');
      add(rc.arc(244, 76, 62, 62, Math.PI * 1.15, Math.PI * 1.55, false, o({ strokeWidth: 1.3 })), 'accent');
      add(rc.arc(244, 76, 62, 62, Math.PI * 1.75, Math.PI * 2.1, false, o({ strokeWidth: 1.3 })), 'accent');
    }
  };

  var svgs = Array.prototype.slice.call(document.querySelectorAll('svg[data-art]'));
  if (!window.rough) return; // without the library the rows still read fine as text

  svgs.forEach(function (svg) {
    var rc = rough.svg(svg);
    var add = function (node, cls) {
      if (cls) cls.split(' ').forEach(function (c) { node.classList.add(c); });
      svg.appendChild(node);
    };
    (ART[svg.dataset.art] || function () {})(rc, add, svg);
  });

  if (reduce || !('IntersectionObserver' in window)) return;

  // Prepare each stroke to be traced, then trace when the sketch scrolls into view.
  svgs.forEach(function (svg) {
    var paths = svg.querySelectorAll('path');
    var total = paths.length;
    Array.prototype.forEach.call(paths, function (p, i) {
      var len = 0;
      try { len = p.getTotalLength(); } catch (e) {}
      if (!len) return;
      p.style.strokeDasharray = len + ' ' + len;
      p.style.strokeDashoffset = len;
      p.style.transitionDelay = Math.round((i / total) * 650) + 'ms';
    });
    svg.classList.add('sk-armed');
  });

  // Draw on the way in; wipe instantly once fully out of view so it redraws next time.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var svg = e.target;
      if (e.isIntersecting && e.intersectionRatio >= 0.25) {
        svg.classList.remove('sk-reset');
        void svg.getBoundingClientRect();
        svg.classList.add('sk-drawn');
      } else if (!e.isIntersecting) {
        svg.classList.add('sk-reset');
        svg.classList.remove('sk-drawn');
      }
    });
  }, { threshold: [0, 0.25] });
  svgs.forEach(function (svg) { io.observe(svg); });
})();

/* Gentle reveal for text blocks below the fold. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var fold = window.innerHeight;
  els.forEach(function (el) { if (el.getBoundingClientRect().top > fold) el.classList.add('armed'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  els.forEach(function (el) { io.observe(el); });
})();
