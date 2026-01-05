const STUDY_START = new Date('2024-08-28T00:00:00+07:00');
const EXP_COUNT = 11;
let PROJECTS_COUNT = 5;

function monthsSince(start, now = new Date()) {
  const y = now.getFullYear() - start.getFullYear();
  const m = now.getMonth() - start.getMonth();
  let diff = y * 12 + m;
  if (now.getDate() < start.getDate()) diff -= 1;
  return Math.max(0, diff);
}

function animateCount(el, target, {duration=1300, suffix=''} = {}) {
  const start = 0;
  const startTime = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);

  function frame(now) {
    const k = Math.min(1, (now - startTime) / duration);
    const val = Math.round(start + (target - start) * ease(k));
    el.textContent = `${val}${suffix}`;
    if (k < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function fetchProjectCount() {
  try {
    const res = await fetch('/api/projects?count=true');
    const data = await res.json();
    PROJECTS_COUNT = data.count || 5;
  } catch (err) {
    console.error('Failed to fetch project count:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await fetchProjectCount(); 

  const monthsEl = document.getElementById('stat-months');
  const projEl   = document.getElementById('stat-projects');
  const expEl    = document.getElementById('stat-exp');
  const items    = document.querySelectorAll('.stat-item');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target.dataset.done) return;
      e.target.classList.add('visible');
      const numEl = e.target.querySelector('.num');
      const suffix = numEl.dataset.suffix || '+';
      if (numEl === monthsEl)
        animateCount(monthsEl, monthsSince(STUDY_START), {suffix});
      else if (numEl === projEl)
        animateCount(projEl, PROJECTS_COUNT, {suffix});
      else if (numEl === expEl)
        animateCount(expEl, EXP_COUNT, {suffix});
      e.target.dataset.done = '1';
    });
  }, { threshold: 0.3 });

  items.forEach(item => io.observe(item));

  setInterval(() => {
    monthsEl.textContent = `${monthsSince(STUDY_START)}${monthsEl.dataset.suffix || '+'}`;
  }, 3600000);
});