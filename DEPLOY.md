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
