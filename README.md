# Gorewell Ltd — Marketing Site

Static marketing website for Gorewell Ltd. **Smart Distribution. Global Connections.**

- Plain HTML/CSS/vanilla JS — no build step, no frameworks. Deploy anywhere by copying the files.
- Live at https://www.gorewell.co.uk (GitHub Pages custom domain, deploys automatically from `main`; DNS at IONOS, leoncjg.github.io/gorewell-site redirects here).
- Local preview: `powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1` then open http://localhost:8430/.
- Shared styles in `css/style.css`, shared behaviour (nav, dotted world map, stat count-up, contact form) in `js/main.js`.
- Add team members in the `MEMBERS` array at the top of `team.html`.
