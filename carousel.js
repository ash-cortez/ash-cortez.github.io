/* Coverflow carousel: one card in the spotlight, neighbors angled back. Auto-rotates; a click pauses it, the play button resumes. */
document.querySelectorAll('.carousel').forEach(function (root) {
  var stage = root.querySelector('.carousel-stage');
  var cards = Array.prototype.slice.call(stage.querySelectorAll('.card'));
  var dots = root.querySelector('.carousel-dots');
  var n = cards.length, active = 0, timer = null, paused = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INTERVAL = 2500;

  cards.forEach(function (card, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', 'Show ' + card.querySelector('h3').textContent);
    d.addEventListener('click', function () { go(i); });
    dots.appendChild(d);
    card.addEventListener('click', function (e) {
      if (i !== active) { go(i); return; }
      if (paused) { e.stopPropagation(); setPaused(false); }
    });
  });

  function fitHeight() {
    var h = 0;
    cards.forEach(function (c) { h = Math.max(h, c.offsetHeight); });
    stage.style.height = h + 'px';
  }
  function render() {
    cards.forEach(function (card, i) {
      var off = (i - active + n) % n;
      if (off > n / 2) off -= n;
      var pos = off === 0 ? '0' : off === 1 ? '1' : off === -1 ? '-1' : 'far';
      card.dataset.pos = pos;
      card.setAttribute('aria-hidden', pos === '0' ? 'false' : 'true');
    });
    Array.prototype.forEach.call(dots.children, function (d, j) {
      d.setAttribute('aria-current', j === active ? 'true' : 'false');
    });
  }
  function go(i) { active = (i + n) % n; render(); }
  function start() { if (!reduce && !paused && !timer) timer = setInterval(function () { go(active + 1); }, INTERVAL); }
  function stop() { clearInterval(timer); timer = null; }
  function restart() { stop(); start(); }

  root.querySelectorAll('.carousel-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { go(active + Number(btn.dataset.dir)); });
  });
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { go(active + 1); setPaused(true); }
    if (e.key === 'ArrowLeft') { go(active - 1); setPaused(true); }
  });
  // Clicking anywhere in the carousel pauses it; the play/pause button (or clicking the
  // spotlighted card) toggles it back on.
  var toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'carousel-btn carousel-toggle';
  root.querySelector('.carousel-controls').appendChild(toggle);
  function setPaused(p) {
    paused = p;
    toggle.textContent = p ? '\u25B6' : '\u275A\u275A';
    toggle.setAttribute('aria-label', p ? 'Resume rotation' : 'Pause rotation');
    root.classList.toggle('is-paused', p);
    p ? stop() : start();
  }
  toggle.addEventListener('click', function (e) { e.stopPropagation(); setPaused(!paused); });
  root.addEventListener('click', function () { if (!paused) setPaused(true); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  var x0 = null;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { go(active + (dx < 0 ? 1 : -1)); setPaused(true); } else { start(); }
    x0 = null;
  });

  setPaused(reduce);
  render();
  fitHeight();
  window.addEventListener('resize', fitHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeight);
});
