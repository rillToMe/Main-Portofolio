(async function() {
  const certGrid = document.querySelector('#certs .grid-3');
  if (!certGrid) return;

  try {
    const res = await fetch('/api/certificates?limit=4');
    const data = await res.json();

    if (!data.certificates || data.certificates.length === 0) {
      certGrid.innerHTML = '<p style="color: var(--text-dim); text-align: center;">No certificates available.</p>';
      return;
    }

    certGrid.innerHTML = data.certificates.map(c => `
      <div class="cert-card">
        <div class="cert-thumb">
          <img src="${c.thumbnail_url}" alt="${c.title}" loading="lazy" />
        </div>
        <p>${c.title}</p>
        <a href="credentials/badges?file=${encodeURIComponent(c.pdf_url)}&title=${encodeURIComponent(c.title)}"
           class="btn tiny btn-ghost">
          <i class="fa-solid fa-up-right-from-square"></i> Visit
        </a>
      </div>
    `).join('');

  } catch (err) {
    console.error('Failed to load certificates:', err);
    certGrid.innerHTML = '<p style="color: var(--error);">Failed to load certificates.</p>';
  }
})();