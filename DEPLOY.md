# SofaFit Deployment

This project is deployed as a Docker container on `193.187.95.17`.

## Current Production Setup

- Server path: `/opt/sofafit`
- Container name: `sofafit`
- Host port: `8080`
- Container port: `80`
- Direct URL (without proxy): `http://193.187.95.17:8080`

## First-Time Setup (already done)

```bash
ssh root@193.187.95.17
mkdir -p /opt/sofafit
git clone https://github.com/denisgurovch-hue/sofafit.git /opt/sofafit
cd /opt/sofafit
docker build -t sofafit:latest .
docker run -d --name sofafit --restart unless-stopped -p 8080:80 sofafit:latest
```

## Regular Update After New Push

```bash
ssh root@193.187.95.17
cd /opt/sofafit
git pull
docker build -t sofafit:latest .
docker rm -f sofafit || true
docker run -d --name sofafit --restart unless-stopped -p 8080:80 sofafit:latest
```

## Health Checks

```bash
# On server
docker ps --filter name=sofafit
docker logs --tail 100 sofafit
curl -I http://127.0.0.1:8080

# From local machine
curl -I http://193.187.95.17:8080
```

## Rollback to Stable Tag

Current baseline tag: `v1.0.0`

```bash
ssh root@193.187.95.17
cd /opt/sofafit
git fetch --tags
git checkout v1.0.0
docker build -t sofafit:latest .
docker rm -f sofafit || true
docker run -d --name sofafit --restart unless-stopped -p 8080:80 sofafit:latest
```

To return back to `main` after rollback test:

```bash
cd /opt/sofafit
git checkout main
git pull
```

## Notes

- Port `80` is occupied by another stack on this server, so SofaFit runs on `8080`.
- If you later move SofaFit behind your reverse proxy, keep container on internal port and proxy to `127.0.0.1:8080`.

## Enable HTTPS Behind Existing Nginx

Use this section if your server already has a shared Nginx reverse proxy (same pattern as your other project).

### Quick setup for `mini.sofafit.ru`

1. DNS at registrar:
   - `A` record: `mini.sofafit.ru` -> `193.187.95.17`
2. Ensure container is local-only (see step 1 below).
3. Copy ready config from this repo: `deploy/nginx/mini.sofafit.ru.conf`
4. Enable site, issue cert, reload Nginx:

```bash
ssh root@193.187.95.17
cp /opt/sofafit/deploy/nginx/mini.sofafit.ru.conf /etc/nginx/sites-available/mini.sofafit.ru.conf
ln -s /etc/nginx/sites-available/mini.sofafit.ru.conf /etc/nginx/sites-enabled/mini.sofafit.ru.conf
nginx -t
systemctl reload nginx
apt-get update
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d mini.sofafit.ru
nginx -t
systemctl reload nginx
curl -I https://mini.sofafit.ru
```

### 1) Keep app container on localhost only

Bind SofaFit to loopback so it is not publicly exposed directly:

```bash
ssh root@193.187.95.17
cd /opt/sofafit
git pull
docker build -t sofafit:latest .
docker rm -f sofafit || true
docker run -d --name sofafit --restart unless-stopped -p 127.0.0.1:8080:80 sofafit:latest
```

### 2) Install Nginx vhost

1. Copy `deploy/nginx/sofafit.conf.example` to the server, e.g. as `/etc/nginx/sites-available/sofafit.conf`.
   - For your current domain, you can directly use `deploy/nginx/mini.sofafit.ru.conf`.
2. Replace:
   - `YOUR_DOMAIN` with your domain (example: `sofafit.example.com`)
   - `WWW_YOUR_DOMAIN` if you use `www`, otherwise remove it
3. Enable config and validate:

```bash
ln -s /etc/nginx/sites-available/sofafit.conf /etc/nginx/sites-enabled/sofafit.conf
nginx -t
systemctl reload nginx
```

### 3) Issue Let's Encrypt certificate

```bash
apt-get update
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d YOUR_DOMAIN -d WWW_YOUR_DOMAIN
```

If you do not use `www`, run only one `-d` flag.

### 4) Verify HTTPS

```bash
curl -I https://YOUR_DOMAIN
```

Expected result: HTTP 200/301 and a valid TLS certificate.

### 5) Cert auto-renewal check

```bash
systemctl status certbot.timer
certbot renew --dry-run
```

## Embed UI (`sofafit-room-designer` → `furniture-inpaint-api`)

The AI fitting **iframe** (`/static/embed/…` on `demo.sofafit.ru`) is **not** built from this `sofafit` repo. It comes from a separate frontend-only project:

| Item | Value |
|------|--------|
| GitHub | `https://github.com/denisgurovch-hue/sofafit-room-designer` |
| Role | Production build of the embed app only (widget UI inside the iframe) |
| Target on server | `~/furniture-inpaint-api/furniture-inpaint-api/app/static/embed/` (i.e. `/root/furniture-inpaint-api/furniture-inpaint-api/app/static/embed/`) |

The **product-card snippet** on partner sites loads that embed URL from `demo.sofafit.ru`; Nginx in the `furniture-inpaint-api` stack serves files from `app/static/embed/`.

### Single source of truth

| Layer | Role |
|-------|------|
| **GitHub `main`** (`sofafit-room-designer`) | Canonical source code — always align Mac, server clone, and Lovable to this branch. |
| **Lovable** | Editor — must **push to the same repo** (`main` or PR merged into `main`). |
| **Mac (Cursor)** | Local dev — commit/push to `main` (or PR). **Run `git pull origin main` before starting work** if you or Lovable changed the repo elsewhere. |
| **Server `~/sofafit-room-designer`** | Clone used for `git pull` + build (requires GitHub auth: SSH deploy key or HTTPS token). |
| **`.../app/static/embed/`** | **Build output only** (`npm run build` → `dist/`). Do not treat this folder as the place to edit source. |

### Aligning all copies (after drift)

When embed files on the server are already correct but git clones diverged:

1. Ensure **GitHub `main`** contains every commit you want (including merges from Lovable).
2. **Mac:** `git fetch origin && git checkout main && git reset --hard origin/main` (or `git pull --rebase` if you prefer not to hard reset).
3. **Server clone:** same after fixing Git access — `git fetch && git checkout main && git reset --hard origin/main`.
4. **Lovable:** open project and **sync / pull from GitHub** so the editor matches `main`.

Rebuild embed from that commit and copy `dist/` to `app/static/embed/` if you need to prove parity.

### Recommended workflow: Lovable + Cursor + deploy

**Rule:** embed source changes always land in **GitHub `main` first**, then build, then copy into `furniture-inpaint-api`.

**Path A — edits in Cursor (Mac)**

1. `git pull origin main` (pick up Lovable or other pushes).
2. Edit, `npm run build`, test locally.
3. `git push origin main`.
4. Deploy (server path below or fallback).

**Path B — edits in Lovable**

1. Finish in Lovable with **push to GitHub** (`main` or merge PR to `main`).
2. Before next Cursor session: **`git pull origin main`** on Mac.

**Deploy embed (server has Git access)**

```bash
ssh root@193.187.95.17
cd ~/sofafit-room-designer
git pull origin main
npm install    # or npm ci when lockfile matches
npm run build
EMBED=~/furniture-inpaint-api/furniture-inpaint-api/app/static/embed
rm -rf "${EMBED:?}/"*
cp -r dist/* "$EMBED/"
cd ~/furniture-inpaint-api/furniture-inpaint-api && docker compose restart nginx
```

If Cloudflare (or another CDN) caches `/static/embed/`, purge cache or hard-refresh when verifying.

**Avoid**

- Editing only on the server without pushing — changes are lost on the next `git reset`.
- Editing source inside `app/static/embed/` — overwrite on next deploy.
- Parallel edits in Lovable and Cursor **without** pulling between sessions.

### Fallback: server cannot `git pull` (HTTPS auth)

Build on Mac from current `main`, stream `dist/` to the server:

```bash
cd /path/to/sofafit-room-designer
git pull origin main && npm run build && cd dist && tar czf - . | ssh root@193.187.95.17 \
  'EMBED=/root/furniture-inpaint-api/furniture-inpaint-api/app/static/embed; rm -rf ${EMBED:?}/*; tar xzf - -C "$EMBED"'
ssh root@193.187.95.17 'find /root/furniture-inpaint-api/furniture-inpaint-api/app/static/embed -name "._*" -delete; cd /root/furniture-inpaint-api/furniture-inpaint-api && docker compose restart nginx'
```

Fix long-term by adding a **read-only deploy key** (SSH) for `sofafit-room-designer` on the server.

### Pipeline (legacy)

Previously: edit on **Lovable** → pull to server → copy **embed** into `furniture-inpaint-api`.  
**Now:** GitHub **`main`** is the contract; Lovable and Cursor are two ways to update it; the **copy into `app/static/embed/`** step stays mandatory after each production build.

### Optional improvements

- **GitHub Actions** on push to `main`: build embed, deploy `dist` over SSH to `app/static/embed/`, restart `nginx` (store SSH key / host in repo secrets).
- **Pre-commit on Mac:** run `npm run build` before push to catch broken embed builds early.

### Checklist when releasing embed changes

- [ ] **GitHub:** latest commit on `main` is what you intend to ship
- [ ] **Mac:** `git pull origin main` before editing; push after Cursor changes
- [ ] **Lovable:** changes pushed / merged to `main` before relying on Mac-only state
- [ ] **Server:** `git pull` → `npm run build` → `cp -r dist/*` → `.../app/static/embed/` → `docker compose restart nginx` (or fallback `tar | ssh` from Mac)
- [ ] **Smoke-test:** widget from `mini.sofafit.ru` / store; iframe URL under `demo.sofafit.ru/static/embed/…`
