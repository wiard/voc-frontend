# figma-make-app

React + Vite + Tailwind CSS project, originally generated inside Figma Make.
The application now runs independently on the operator's Mac.

## Development Server

Use `pnpm dev` when a local development server is needed. It binds only to
`127.0.0.1:5173`; no server is assumed to be running.

- Preview URL: `http://127.0.0.1:5173`
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Standalone React and Tailwind CSS v4 configuration plus the `@` alias for `src`
- `.node-version` and `package.json` - Tested Node.js version and pinned pnpm version
- `tests/homepage.spec.ts` - Browser regression checks using installed Google Chrome
- `docs/PHASE1_REPORT.md` - Phase 1 scope, results and integration boundaries
- `docs/PHASE2A_REPORT.md` - Publishing research, CI safeguards and activation boundaries
- `.github/workflows/build.yml` - Build-only CI; no publication permissions
- `.github/workflow-templates/pages-publish.yml.disabled` - Inactive publication template; never activate without explicit authorization
- `scripts/publication-checks.mjs` and `tests/publishing.test.mjs` - Local publication and secret-pattern safeguards

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

Tailwind emits utility classes in `@layer utilities`, and CSS outside any cascade layer overrides every layer regardless of specificity. Put global element styles, such as resets and defaults for `body`, headings, `button`, or `input`, inside `@layer base { ... }` so utility classes on those elements still apply. Tailwind's Preflight already applies `box-sizing: border-box`, removes default margins, and sets `font: inherit` on form controls, so do not repeat those rules.
