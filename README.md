# ATS — Resume analyzer

 Web app that converts uploaded PDF resumes to images, stores them in Puter (an injected SDK), and runs an AI feedback pipeline to give ATS-friendly suggestions and scores.

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



