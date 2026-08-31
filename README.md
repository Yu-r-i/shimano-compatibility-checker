# Shimano Compatibility Checker

A web application that checks the compatibility between Shimano bicycle components.

This project is built with React (Vite) on the frontend and Hono on the backend, running as a single Cloudflare Worker.  
It allows users to search Shimano models and check compatibility between different generations or series.

---

## Overview

Shimano Compatibility Checker helps users verify whether various Shimano bicycle components  
(derailleurs, cassettes, cranksets, etc.) are compatible with each other.  
Users can search for a specific model and immediately see compatibility results in the browser.

Parts data and the compatibility rule engine live entirely on the server (Hono API); the client only
sends the selected part IDs and renders whatever the API returns. This keeps the rules and data
adaptable (e.g. swapping the JSON data source for a database later) without any frontend redeploy.

---

## Features

- Model search: search Shimano parts by name or series code
- Compatibility check: automatically determines compatible and incompatible parts via the Hono API
- Simple and clear result display
- Easy to run locally with pnpm

---

## Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | Vite, React, TypeScript |
| Backend  | Hono (TypeScript), running as a Cloudflare Worker |
| Deployment | Cloudflare Workers (Workers Static Assets) |
| Package Manager | pnpm |

---

## Directory Structure

~~~bash
Shimano_CompatibilityChecker/
├── index.html              # Vite entry HTML
├── src/                    # React frontend
│   ├── api/                # fetch wrapper for the Hono API
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── worker/                 # Hono backend (Cloudflare Worker)
│   ├── routes/              # /api/parts, /api/compatibility
│   ├── domain/              # compatibility rules + parts repository
│   └── data/                 # source-of-truth parts JSON
├── vite.config.ts
├── wrangler.jsonc
├── package.json
└── .gitignore
~~~

---

## Setup and Run

1. Clone the repository
    ```bash
    git clone https://github.com/Yu-r-i/Shimano_CompatibilityChecker.git
    cd Shimano_CompatibilityChecker
    ```

2. Install dependencies
    ```bash
    pnpm install
    ```

3. (Optional) Configure environment values — copy `.env.example` to `.env.local` and set your own
   deployment domain once you have one; the committed `.env` ships with placeholder values so the
   app builds and runs out of the box.

4. Start the development server
    ```bash
    pnpm dev
    ```

This starts a single dev server serving both the React app and the Hono API (`/api/*`).

---

## Deployment

Deployment targets [Cloudflare Workers](https://developers.cloudflare.com/workers/) (Workers Static
Assets + Hono), not GitHub Pages.

1. Build the production version
    ```bash
    pnpm build
    ```

2. Deploy with [Wrangler](https://developers.cloudflare.com/workers/wrangler/):
    ```bash
    pnpm deploy
    ```
   This requires a Cloudflare account and being logged in (`wrangler login`), or `CLOUDFLARE_API_TOKEN`
   / `CLOUDFLARE_ACCOUNT_ID` set in your environment for non-interactive/CI use.

3. CI/CD (`.github/workflows/deploy.yml`) deploys automatically on push to `main` via Wrangler. It
   requires the following repository secrets to be configured on GitHub (Settings → Secrets and
   variables → Actions), which is a one-time manual setup on the Cloudflare + GitHub side:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

4. Once you have a real deployment domain, set `VITE_SITE_URL` / `VITE_OGP_IMAGE_URL` (and optionally
   `VITE_GOOGLE_SITE_VERIFICATION`) via `.env.local` or CI environment variables so the SEO/OGP tags in
   `index.html` point at the correct domain.

---

## Author
Yuri Funato  
Kindai University - Electronic Commerce Laboratory (ECL)  
GitHub: https://github.com/Yu-r-i
