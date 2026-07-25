@echo off
cd /d "C:\Users\ohanu\OneDrive\Desktop\Unique levi's-clean"
vercel project update uniquelevis-api --scope kiaras-projects-451d3b80 --install-command "corepack prepare pnpm@11.13.0 --activate && corepack pnpm --filter @workspace/api-server install --frozen-lockfile" --build-command "corepack pnpm --filter @workspace/api-server build"
