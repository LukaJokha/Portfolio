# Luka Jokhadze — Portfolio

An interactive developer portfolio: a real-time chrome sculpture, a floating navigation dock, selected project explorations, and a direct way to get in touch.

**Live:** https://lukajokha.github.io/Portfolio/

## Run locally

Requires Node.js 22.12+ or 24+.

```sh
npm ci
npm run dev
```

`npm run check` checks application syntax. `npm run build` creates the production site in `dist/`; `npm run preview` serves it locally. Vite uses relative asset paths so the build works at the GitHub Pages repository subpath.

## Experience

- Four directly linkable views: `#home`, `#work`, `#about`, and `#contact`.
- Three.js sculpture with drag and keyboard rotation, floating satellites, and three remixable forms. Geometry is generated locally; no remote model files or API keys are required.
- Animation pause, reduced-motion support, tab-aware rendering, capped pixel density, and a static fallback if WebGL is unavailable.
- Accessible project dialogs, real repository links, and an email copy action.
- Responsive desktop, tablet, and phone layouts.

The project previews are original visual studies, not screenshots or claims about production metrics. Project descriptions are based on the linked repositories.

## Edit content

Update visible copy in `index.html` and project details in `script.js`. Sculpture geometry and lighting live in `scene.js`, with presentation in `style.css`.

Google Fonts loads DM Sans, Space Grotesk, and Instrument Serif, with system fallbacks. Three.js and the application are bundled locally by Vite.

## Deployment

The prebuilt site is included in `docs/` for branch-based GitHub Pages hosting. Run `npm run build:pages` after source changes and commit the updated `docs/` directory. Set **Settings → Pages → Deploy from a branch → main → /docs**.

A manually triggered GitHub Actions workflow is also included. To use it, select **GitHub Actions** as the Pages source and run the deployment workflow. No secrets are required. GitHub account billing restrictions can prevent either hosting workflow from starting.
