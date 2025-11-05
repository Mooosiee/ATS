# ATS — Resume analyzer (demo)

Small demo app that converts uploaded PDF resumes to images, stores them in Puter (an injected SDK), and runs an AI feedback pipeline to give ATS-friendly suggestions and scores.

This project uses React + TypeScript + Vite (via react-router dev tooling), Tailwind CSS, PDF.js for PDF rendering, and a Puter SDK injected at runtime to handle storage, auth and AI calls.

## Features

- Upload PDF resumes (drag & drop)
- Generate detailed, resume-specific feedback using Puter's AI chat — when you upload a resume the app sends it to Puter's AI and displays structured, actionable feedback and scores

## Quick start

Prerequisites:

- Node.js (v18+ recommended)
- npm (or yarn)

Install dependencies:

PowerShell

```powershell
npm install
```

Run the dev server (hot-reload):

PowerShell

```powershell
npm run dev
```

Build for production:

PowerShell

```powershell
npm run build
```

Type-check the project:

PowerShell

```powershell
npm run typecheck
```

Run the production server (after build):

PowerShell

```powershell
npm start
```

## Important project notes

- Puter SDK: The Puter API is injected into `window.puter` at runtime (the SDK is not an npm package). Types for Puter are declared in `types/puter.d.ts`. If the backend shape changes, update those declarations accordingly.
- PDF.js: The project lazy-loads `pdfjs-dist/build/pdf.mjs`. A small declaration `types/pdfjs-dist.d.ts` exists to silence TS when importing the `.mjs` build. The worker file `public/pdf.worker.min.mjs` is used by PDF.js and must be present in `public/`.
- AI response shape: The tutorial includes a `AIResponse` declaration in `types/puter.d.ts`. The real runtime shape can vary (string vs object vs array). Use `console.log` to inspect `ai.feedback` responses and update `types/` when you rely on specific fields.

## Key files and folders

- `app/` — React entry, routes and components
  - `app/routes/upload.tsx` — upload form and analysis flow
  - `app/components/FileUploader.tsx` — drag & drop upload UI
  - `app/components/CompareViewer.tsx` — renders original PDF, converted image and pixel diff
  - `app/lib/pdf2img.ts` — PDF → PNG conversion using PDF.js
  - `app/lib/puter.ts` — local wrapper around `window.puter` (Zustand store)
- `types/` — TypeScript declarations and interfaces
  - `types/index.ts` — app domain types (Resume, Feedback, etc.)
  - `types/puter.d.ts` — Puter SDK response / API types (custom declarations)
  - `types/pdfjs-dist.d.ts` — small module declaration for the `.mjs` PDF.js build
- `public/` — static assets (icons, pdf.worker, images)

## Troubleshooting & tips

- "Could not find a declaration file for module 'pdfjs-dist/build/pdf.mjs'": we provided `types/pdfjs-dist.d.ts` to declare that module; if you still see issues, ensure `types/` is included (it is by default in tsconfig) and restart the TS server in your editor.
- "Property 'message' does not exist on type 'never'" (when accessing `err.message` or nested response properties): use safe narrowing. Example used across the repo:

```ts
const msg = err instanceof Error ? err.message : String(err);
```

- Inspect actual AI responses during development by adding `console.log(feedback)` right after `await ai.feedback(...)` in `app/routes/upload.tsx`. That makes it easy to update `types/puter.d.ts` to match real output.

## Contributing / learning

This project is a learning demo. If you're following a tutorial, it's normal to not understand everything up-front. Focus on the components you need to change. When you discover a runtime shape (e.g., AI returns an array), update the type declarations and add a small helper (e.g., `getAIContent`) to normalize the responses.

If you want me to:

- add a small `getAIContent` helper and wire it into the upload flow,
- tighten `types/puter.d.ts` to reflect array item shapes (e.g. `{ type: 'text'; text: string }`), or
- add a quick CONTRIBUTING.md or more detailed docs for local development — tell me which and I will add it.

## License

This tutorial/demo repo has no license file included. If you plan to publish or share it, add a `LICENSE` file (MIT is a common choice for demos).

Happy hacking!
