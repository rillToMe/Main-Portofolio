# 🌌 Personal Portfolio - DitDev

[![Stars](https://img.shields.io/github/stars/rillToMe/Main-Portofolio?style=for-the-badge&color=2EC4B6)](https://github.com/rillToMe/Main-Portofolio/stargazers)
[![Forks](https://img.shields.io/github/forks/rillToMe/Main-Portofolio?style=for-the-badge&color=00bcd4)](https://github.com/rillToMe/Main-Portofolio/network/members)
[![License](https://img.shields.io/github/license/rillToMe/Main-Portofolio?style=for-the-badge&color=1de9b6)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-vercel-000000?style=for-the-badge&logo=vercel)](https://ditdev.vercel.app)
[![Performance](https://img.shields.io/badge/build-lightweight-success?style=for-the-badge&color=2EC4B6)](#)

---

## ✨ Overview

**DitDev** is a personal portfolio site created by **Rahmat Aditya (rillToMe)** -  
a student and developer focused on **Game Development,AI experiments and creative technology**.  
This website serves as a central hub for all of Adit’s projects, experiments, and personal milestones.

Now rebuilt as a **lightweight & high-performance** web experience, balancing **speed, elegance, and clarity**.

---

## 🧠 Features

### 🎨 Interface & UX
- Neon-dark theme with soft azure glow.  
- Responsive for all screen sizes (desktop, tablet, mobile).  
- Smooth hover, fade, and scroll animations.  
- Lightweight build: only vanilla HTML, CSS, and JS (no frameworks).

### 🎧 Interactive Experience
- **Lo-fi background music** toggle with soft fade-in and dynamic placement.  
- Adaptive position: automatically moves above the Back-to-Top button when visible.  
- Manual play control for maximum browser compatibility.

### 💼 Sections
- **About Me** - personal bio & core background.  
- **Tech Stack** - showcases key technologies (Python, NumPy, PyTorch, Unity, Blender, etc).  
- **Services** - focuses on:
  - 🎮 *Game Development* - Unity / C# prototyping.
  - 🤖 *AI Experiments* - Python, NumPy, PyTorch.
  - 💻 *Frontend Development* - HTML/CSS/JS demos.
- **Projects** - visual cards of active and finished work.  
- **Certificates** - floating cards with subtle up-down animations.  
- **Stats Section** - auto-updating info:
  - `Months Studying` - auto-count from **Aug 28, 2024**.
  - `Projects` - manual count in JS.
  - `Experiments Done` - dynamically displayed.

---

## 🧩 Tech Stack

| Category | Technologies |
|-----------|---------------|
| **Frontend** | HTML5, CSS3, JavaScript, Node.js |
| **Design & UI** | Neon Theme, Font Awesome Icons, Smooth CSS Animations |
| **AI / ML** | Python, NumPy, PyTorch |
| **Game Development** | Unity (C#), Blender |
| **Deployment** | Vercel |
| **Tools** | Visual Studio Code, Visual Studio, Git, GitHub |

---

## 🏗️ Folder Structure

```bash
AetherStudio/
├── api/
│   ├── lib
│   └── proxy.js
├── admin/
│   ├── js/          # Background music
│   ├── css/            # Styles (style.css, bgm.css)
│   └── thumbs/
├── assets/
│   ├── audio/          # Background music
│   ├── css/            # Styles (style.css, bgm.css)
│   ├── img/            # Images, icons, thumbnails
│   ├── js/             # Scripts (app.js, bgm.js, etc.)
│   └── thumbs/         # Certificate thumbnails
├── credentials/
│   ├── badges.html
│   └── project.html
├── home.html
├── package.json        # Node.js configuration 
├── vercel.json         # Routing & rewrite rules
└── README.md
```

---

## ⚙️ Setup & Local Run

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rillToMe/Main-Portofolio.git
   cd Main-Portofolio
   ```

2. **Run a Local Server**
   You can use VS Code’s Live Server or:
   ```bash
   vercel dev
   ```
   Then open: [vercel dev]()

3. **Edit Content**
   - Update data in `Admin Panel`, `home.html`.  
   - Replace `/assets/audio/lofi.mp3` if you want new background music.  
   - Adjust project & certificate data in `/assets/js/app.js`.

---

## 💫 Highlighted Features
- 🧮 **Auto Study Counter** - months since 28 Aug 2024.  
- 🪶 **Floating Certificates** - infinite looping motion for certificate cards.  
- 🎵 **Smart BGM Button** - floating, responsive, fade transition.  
- 💨 **Lightweight Mode** - optimized, minimal requests for fast load.  

---

## 🧹 Removed Features
| Feature | Reason |
|----------|---------|
| Comment System | Removed to improve loading time and prevent server-side delay. |
| Rating Widget | Removed to avoid spam and unnecessary backend complexity. |
| Admin Dashboard (Beta) | Temporarily disabled to keep static build lightweight. |

---

## 📸 Preview

| Section | Screenshot |
|:--------|:-----------|
| Tech Stack | ![Tech Stack](./assets/img/preview-readme/preview-techstack.png) |
| Services | ![Services](./assets/img/preview-readme/preview-service.png) |
| Projects | ![Projects](./assets/img/preview-readme/preview-project.png) |
| Certificates | ![Certificates](./assets/img/preview-readme/preview-certs.png) |

---

## 🌐 Deployment
Deployed with **[Vercel](https://vercel.com)** for automatic updates.  
Every push to `main` instantly rebuilds and redeploys the live site.  

🔗 **Live Site:** [https://ditdev.vercel.app/](https://ditdev.vercel.app/)

---

## 📄 License
This project is licensed under the **MIT License**   
feel free to fork, learn, and remix with proper attribution.

---

## 👤 Author
**Rahmat Aditya (rillToMe)**  
💼 SMKN 4 Payakumbuh - XI PPLG 2  
🌐 [Portfolio Live](https://ditdev.vercel.app)  
🐙 [GitHub](https://github.com/rillToMe)  
📧 [rahmataditya.dev@gmail.com](mailto:rahmataditya.dev@gmail.com)

---

> “Build. Learn. Iterate. Evolve - that’s what Aether Studio stands for.”  
> - **Rahmat Aditya**

