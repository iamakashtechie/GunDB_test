# TODO — GunDB_test

Purpose: Learn and implement a local-first GunDB todo app with a local relay for peer discovery and end-to-end encrypted private tasks.

Status key: [ ] not started  [~] in-progress  [x] done

Tasks
- [~] Start local relay
  - Install `gun`, add `type": "module"` to `package.json` if using ESM
  - npm script: `start-relay`: `node "server/server.js"`
  - Run: `node "server/server.js"` (default port 8765)

- [ ] Create minimal client
  - `client/index.html` with Gun init pointing to `http://localhost:8765/gun`
  - Serve with `python -m http.server 8000` or `npx http-server -p 8000`

- [ ] Add user auth (SEA)
  - Integrate `gun.user()` create/auth flows
  - Store user keys locally (SEA does this automatically)

- [ ] Private tasks implementation
  - Use `user.get('tasks')` for encrypted, per-user task storage
  - UI: login/register, add/list tasks, mark done

- [ ] Encrypted sharing example
  - Example: encrypt a task for another user's public key using `Gun.SEA.encrypt`

- [ ] Sync & offline testing
  - Test two browsers/devices, offline edits, reconnection merge behavior
  - Test metadata observations (timestamps, sizes)

- [ ] Deploy relay (Render / Railway / Fly / VPS)
  - Add `package.json` scripts and Procfile if needed
  - Ensure persistent process and port support

- [ ] Threat model & metadata notes
  - Document what relays can see (encrypted blobs, metadata)
  - UX guidance: default to private namespaces, explicit sharing

Notes — Quick commands

Install relay deps:

```bash
npm init -y
npm install gun
# if using ESM, add to package.json: "type": "module"
```

Start relay:

```bash
node "server/server.js"
# or with PORT: PORT=8765 node "server/server.js"
```

Serve frontend:

```bash
python -m http.server 8000
# or
npx http-server -p 8000
```

Next recommended action: implement `start-relay` npm script and update `index.html` to use the local peer. Ask me to proceed and I'll apply the changes.
