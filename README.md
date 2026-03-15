# GunDB_test

Minimal local-first GunDB demo: a decentralized to-do (tasks) app that syncs peer-to-peer via a local relay.

## Overview
-- Client-only app (`client/index.html`) uses GunDB.
-- A lightweight relay server (`server/server.js`) is used for peer discovery and message routing.
- Designed for local testing: run the relay locally and open the frontend in two different browsers to verify syncing.

## Repo layout
- client/index.html — frontend app (tasks, UI, Gun init)
- server/server.js — minimal Gun relay (Node.js)
- client/Discussion_About_Project.md — project notes

## Prerequisites
- Node.js (16+ recommended)
- npm
- A static file server for the frontend (python, http-server, etc.)

## Local setup & run

1. Install dependencies for the relay:
```sh
npm init -y
npm install gun
# ensure ESM imports: add "type": "module" to package.json
```

2. Start the relay:
```sh
node "server/server.js"
# default port: 8765 (or set PORT env)
```

3. Point the client to the local relay (in index.html):
```html
<!-- set Gun peer to local relay -->
<script>
  const gun = Gun({
    peers: ["http://localhost:8765/gun"]
  });
</script>
```

4. Serve the frontend and open in two browsers:
```sh
# from project root
python -m http.server 8000
# or
npx http-server -p 8000
```
Open http://localhost:8000/index.html in Browser A and Browser B — add tasks and verify real-time sync.

## Notes
- Vercel (serverless) is unsuitable for a Gun relay because relays require a long-running process and WebSocket support. Use local, Railway, Render, Fly.io, or a VPS for deploys.
- The relay only assists discovery/routing — it does not own your data.

## Next steps / tips
- Add an npm script (e.g., `"start-relay": "node 'server/server.js'"`) for convenience.
- For demo/portfolio, consider deploying the relay to Render or Railway and configuring multiple peers for resilience.