// ── Fade-in on scroll ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── Mobile nav toggle ──
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ══════════════════════════════════════════
// CARROSSEL AUTOMÁTICO
// ══════════════════════════════════════════
(function () {
  const track   = document.getElementById('carouselTrack');
  const slides  = track ? track.querySelectorAll('.carousel-slide') : [];
  const dots    = document.querySelectorAll('.carousel-dots .dot');
  const btnPrev = document.getElementById('carouselPrev');
  const btnNext = document.getElementById('carouselNext');

  if (!track || slides.length === 0) return;

  const TOTAL        = slides.length;
  const INTERVAL_MS  = 3000;   // 3 s de exibição por card
  const TRANSITION_S = 0.7;    // deve bater com o CSS transition

  let current  = 0;
  let timer    = null;
  let isHovered = false;

  /* Calcula o deslocamento: cada slide ocupa 100% da largura do track
     mais o gap (1.5rem = 24px via CSS gap, mas usamos JS para simplicidade). */
  function goTo(index, animate = true) {
    current = (index + TOTAL) % TOTAL;

    // Largura real do slide (inclui gap)
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const offset = current * (slideWidth + gap);

    track.style.transition = animate
      ? `transform ${TRANSITION_S}s cubic-bezier(0.4, 0, 0.2, 1)`
      : 'none';
    track.style.transform = `translateX(-${offset}px)`;

    // Atualiza dots
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (!isHovered) next();
    }, INTERVAL_MS);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Botões
  btnNext && btnNext.addEventListener('click', () => { next(); startTimer(); });
  btnPrev && btnPrev.addEventListener('click', () => { prev(); startTimer(); });

  // Dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      startTimer();
    });
  });

  // Pausa no hover
  const outer = track.closest('.carousel-outer');
  if (outer) {
    outer.addEventListener('mouseenter', () => { isHovered = true; });
    outer.addEventListener('mouseleave', () => { isHovered = false; });
  }

  // Touch swipe (mobile)
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    isHovered = true;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    isHovered = false;
    startTimer();
  }, { passive: true });

  // Recalcula posição no resize (sem animação)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current, false), 100);
  });

  // Inicia
  goTo(0, false);
  startTimer();
})();
