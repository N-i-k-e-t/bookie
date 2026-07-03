# Deploying Bookie to Vercel

Bookie is a **privacy-first, on-device AI** app (Vite + React 19). It runs the
LLM and embedding models entirely in the browser via `@huggingface/transformers`
in Web Workers. That requires **cross-origin isolation** (`SharedArrayBuffer`),
which is why the COOP/COEP headers in [`vercel.json`](vercel.json) are essential.

## Readiness checklist (all ✅)

- [x] `npm run build` passes clean (TypeScript + Vite)
- [x] `vercel.json` sets `Cross-Origin-Opener-Policy: same-origin` and
      `Cross-Origin-Embedder-Policy: require-corp` for all routes
- [x] No client-side router → no SPA rewrite rules needed (navigation is
      state-based via the Zustand `appStore`)
- [x] `.gitignore` excludes `dist/` and `node_modules/`
- [x] Repo pushed to https://github.com/N-i-k-e-t/bookie

## Deploy via the Vercel dashboard (recommended)

1. Go to **https://vercel.com/new**.
2. **Import** the `N-i-k-e-t/bookie` GitHub repository (authorize GitHub if asked).
3. Vercel auto-detects **Vite**. Confirm these settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. No environment variables are required (everything runs on-device).
5. Click **Deploy**.

After the first deploy, **every push to `main` auto-deploys** — which pairs with
the local auto-push watcher (`scripts/auto-push.ps1`) if you re-enable it.

## Things to expect (not errors)

- **Large first load.** The build emits a ~23 MB WASM runtime
  (`ort-wasm-simd-threaded`, ~5.8 MB gzipped), and the browser downloads the
  actual AI models from Hugging Face on first use. This is inherent to on-device
  AI — nothing hits a server, but the initial download is heavy. Consider a
  loading state (the app already has `LoadingOrb` / `ThinkingPage`).
- **Chunk-size warnings** during build are informational, not failures.

## Verifying cross-origin isolation in production

Open the deployed site, open DevTools console, and run:

```js
crossOriginIsolated   // must be true
```

If it's `false`, the COOP/COEP headers aren't being applied — recheck
`vercel.json` is at the repo root and redeploy.
