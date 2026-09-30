(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Progressive reveal: .rv content stays visible when this never runs.
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  // OS-aware download buttons: [data-os-cta] carries data-mac / data-win / data-linux hrefs.
  const ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent;
  const os = /mac|iphone|ipad/i.test(ua) ? 'mac' : /win/i.test(ua) ? 'win' : /linux|x11|cros/i.test(ua) ? 'linux' : null;
  const names = { mac: 'macOS', win: 'Windows', linux: 'Linux' };
  const icons = { mac: '#i-apple', win: '#i-win', linux: '#i-linux' };
  if (os) $$('[data-os-cta]').forEach(a => {
    if (!a.dataset[os]) return;
    a.href = a.dataset[os];
    const label = a.querySelector('[data-os-label]'), use = a.querySelector('use');
    if (label) label.textContent = 'Download for ' + names[os];
    if (use) use.setAttribute('href', icons[os]);
  });
  if (os) $$('[data-os-order]').forEach(row => {
    const hit = row.querySelector(`[data-os="${os}"]`);
    if (hit) { row.prepend(hit); $$('[data-os]', row).forEach(b => b.classList.toggle('btn-primary', b === hit)); $$('[data-os]', row).forEach(b => b.classList.toggle('btn-ghost', b !== hit)); }
  });

  // Film player with a switcher.
  const cinema = document.getElementById('cinema');
  if (cinema) {
    const film = cinema.querySelector('video'), btn = cinema.querySelector('.play'), cap = cinema.querySelector('[data-cap]');
    btn.addEventListener('click', () => { film.controls = true; film.play(); cinema.classList.add('playing'); });
    $$('.reel-tab').forEach(t => t.addEventListener('click', () => {
      $$('.reel-tab').forEach(x => x.setAttribute('aria-selected', String(x === t)));
      film.pause(); film.controls = false; film.src = t.dataset.src; film.poster = t.dataset.poster;
      if (cap) cap.textContent = t.dataset.cap;
      cinema.classList.remove('playing');
    }));
  }

  // Muted autoplay only while on screen; tap toggles sound.
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), { threshold: .4 });
  $$('video[data-auto]').forEach(v => {
    vio.observe(v);
    const fig = v.closest('.short'), snd = fig && fig.querySelector('.snd');
    if (snd) snd.addEventListener('click', () => {
      $$('video[data-auto]').forEach(o => { if (o !== v) { o.muted = true; o.closest('.short')?.classList.remove('sound'); } });
      v.muted = !v.muted; fig.classList.toggle('sound', !v.muted);
      if (!v.muted) { v.currentTime = 0; v.play().catch(() => {}); }
    });
  });

  // Rewrite style demo.
  const out = document.getElementById('polished');
  $$('#styles button').forEach(b => b.addEventListener('click', () => {
    $$('#styles button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    if (out) out.textContent = b.dataset.out;
  }));

  // Close the mobile menu after picking a link.
  $$('.nav-sheet a').forEach(a => a.addEventListener('click', () => a.closest('details').removeAttribute('open')));
})();
