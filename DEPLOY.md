# SofaFit Deployment

This project is deployed as a Docker container on `193.187.95.17`.

## Current Production Setup

- Server path: `/opt/sofafit`
- Container name: `sofafit`
- Host port: `8080`
- Container port: `80`
- Public URL: `http://193.187.95.17:8080`

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
