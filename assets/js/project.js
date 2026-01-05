(async function () {
  const isHomePage =
    window.location.pathname.includes("home.html") ||
    window.location.pathname === "/";

  const projectContainer =
    document.querySelector("#projects .grid-3") ||
    document.querySelector(".project-page");

  if (!projectContainer) return;

  try {
    const limit = isHomePage ? 4 : null;
    const url = limit ? `/api/projects?limit=${limit}` : "/api/projects";

    const res = await fetch(url);
    const data = await res.json();

    if (!data.projects || data.projects.length === 0) {
      projectContainer.innerHTML =
        '<p style="color: var(--text-dim); text-align: center;">No projects available yet.</p>';
      return;
    }

    projectContainer.innerHTML = data.projects
  .map(
    (p) => `
    <article class="project card hover-glow">
      <img src="${p.image_url}" alt="${p.title}" loading="lazy"/>
      <div class="project-body">
        <h4>${p.title}</h4>
        <p class="desc">${escapeHTML(p.description || "")}</p>
        
        <div class="project-footer">
            <button class="desc-toggle" type="button">Read more</button>

            <a class="btn tiny btn-ghost"
              href="${p.github_link || p.demo_link || "#"}"
              target="_blank"
              rel="noopener">
              <i class="fa-solid fa-up-right-from-square"></i> View Details
            </a>
        </div>
      </div>
    </article>
  `
  )
  .join("");

    applyTrimLogic();
  } catch (err) {
    console.error("Failed to load projects:", err);
    projectContainer.innerHTML =
      '<p style="color: var(--error);">Failed to load projects. Please refresh.</p>';
  }
})();

function applyTrimLogic() {
  const CHAR_LIMIT_DESKTOP = 110;
  const CHAR_LIMIT_MOBILE = 140;

  const isMobile =
    matchMedia("(hover: none) and (pointer: coarse)").matches ||
    window.innerWidth <= 620;

  const limit = isMobile ? CHAR_LIMIT_MOBILE : CHAR_LIMIT_DESKTOP;

  document.querySelectorAll(".project.card").forEach((card) => {
    const p = card.querySelector(".project-body .desc");
    const btn = card.querySelector(".desc-toggle");

    if (!p || !btn) return;

    const fullText = normalizeText(p.textContent);
    if (!fullText) {
      btn.remove();
      return;
    }

    if (fullText.length <= limit) {
      btn.remove(); 
      return;
    }

    const shortText = truncateToWord(fullText, limit);

    p.textContent = shortText + "…";
    p.dataset.full = fullText;
    p.dataset.short = shortText;

    btn.addEventListener("click", () => {
      const expanded = card.classList.toggle("expanded");

      if (expanded) {
        p.textContent = fullText;
        btn.textContent = "Show less";
      } else {
        p.textContent = shortText + "…";
        btn.textContent = "Read more";
      }
    });
  });
}

function truncateToWord(str, limit) {
  if (str.length <= limit) return str;
  let cut = str.slice(0, limit);
  return cut.replace(/\s+\S*$/, "");
}

function normalizeText(str) {
  return (str || "").trim().replace(/\s+/g, " ");
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

document.querySelectorAll(".read-more").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".project.card");
    card.classList.toggle("expanded");

    btn.textContent =
      card.classList.contains("expanded")
        ? "Show less"
        : "Read more";
  });
});
