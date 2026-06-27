# Replit Import Guide

## Quick Start

1. Open Replit and import this GitHub repository.
2. Replit will detect `.replit` and run `bash ./start-replit.sh`.
3. Wait for dependencies to install on first run.
4. Open the web preview once the frontend is ready on port `3000`.

## What Starts Automatically

- API server in `server` on port `5000`
- Next.js frontend in `client` on port `3000`
- Frontend `/api/*` requests proxy to `http://127.0.0.1:5000/api/*`

## If Preview Does Not Open

- Confirm Replit is using port `3000` for the web view.
- Click Run again after first dependency installation completes.

## Optional Production Notes

For a full production deployment, prefer dedicated hosting (Vercel/Render/Railway).
Replit setup here is optimized for import-and-run development and demo use.
