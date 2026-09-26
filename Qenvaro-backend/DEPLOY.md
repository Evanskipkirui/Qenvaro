# Qenvaro Backend — VPS Deployment Cheatsheet

Replace every `<placeholder>` before running.

---

## 1. Build the binary locally

```bash
# From Qenvaro-backend/
cd /home/k-kimutai/Qenvaro/Qenvaro-backend

GOOS=linux GOARCH=amd64 go build -o qenvaro-backend .
```

---

## 2. Copy binary + env to VPS

```bash
# Copy the binary
scp qenvaro-backend <user>@<vps-ip>:/tmp/qenvaro-backend

# Copy your env file (fill in real secrets first)
scp .env <user>@<vps-ip>:/tmp/qenvaro.env
```

---

## 3. SSH into VPS — run everything below as root (or sudo)

```bash
ssh <user>@<vps-ip>
sudo -i   # or prefix every command with sudo
```

---

## 4. Create system user + deploy directory

```bash
# Dedicated no-login system user
useradd --system --no-create-home --shell /usr/sbin/nologin qenvaro

# Create deploy dir
mkdir -p /opt/qenvaro/backend

# Move binary & env into place
mv /tmp/qenvaro-backend /opt/qenvaro/backend/qenvaro-backend
mv /tmp/qenvaro.env     /opt/qenvaro/backend/.env

# Permissions: binary executable, env readable only by owner
chmod 750  /opt/qenvaro/backend
chmod +x   /opt/qenvaro/backend/qenvaro-backend
chmod 600  /opt/qenvaro/backend/.env

# Hand everything over to the qenvaro user
chown -R qenvaro:qenvaro /opt/qenvaro
```

---

## 5. PostgreSQL — create DB + user

```bash
sudo -u postgres psql <<'SQL'
CREATE USER qenvaro WITH PASSWORD '<strong-db-password>';
CREATE DATABASE qenvaro OWNER qenvaro;
GRANT ALL PRIVILEGES ON DATABASE qenvaro TO qenvaro;
SQL
```

> Then update `/opt/qenvaro/backend/.env`:
> ```
> DB_USER=qenvaro
> DB_PASSWORD=<strong-db-password>
> DB_NAME=qenvaro
> ```

---

## 6. Run migrations

```bash
sudo -u qenvaro psql -U qenvaro -d qenvaro \
  -f /opt/qenvaro/backend/migrations/001_create_users.sql \
  -f /opt/qenvaro/backend/migrations/002_create_products.sql \
  -f /opt/qenvaro/backend/migrations/003_create_orders.sql \
  -f /opt/qenvaro/backend/migrations/004_create_order_items.sql
```

*(Only needed on first deploy or when migrations are updated.)*

---

## 7. Nginx

```bash
# Install nginx if not already present
apt install -y nginx

# Copy the nginx config
cp /tmp/qenvaro.nginx.conf /etc/nginx/sites-available/qenvaro

# Enable it
ln -s /etc/nginx/sites-available/qenvaro /etc/nginx/sites-enabled/qenvaro

# Test config — must say "syntax is ok"
nginx -t

# Reload nginx
systemctl reload nginx
```

> Edit `/etc/nginx/sites-available/qenvaro` and replace `api.yourdomain.com`
> with your actual domain before continuing.

---

## 8. TLS with Certbot

```bash
apt install -y certbot python3-certbot-nginx

# Issue cert + auto-patch nginx config (--redirect adds the HTTP→HTTPS redirect)
certbot --nginx -d api.yourdomain.com --redirect

# Verify auto-renew timer is active
systemctl status certbot.timer
```

---

## 9. Systemd service

```bash
# Copy service file
cp /tmp/qenvaro.service /etc/systemd/system/qenvaro.service

# Reload daemon, enable on boot, start now
systemctl daemon-reload
systemctl enable qenvaro
systemctl start qenvaro
```

---

## 10. Verify everything is running

```bash
# Service status
systemctl status qenvaro

# Live logs
journalctl -u qenvaro -f

# Nginx status
systemctl status nginx

# Hit the health endpoint
curl -s https://api.yourdomain.com/health
```

---

## Re-deploy (binary update only)

```bash
# Local: rebuild
GOOS=linux GOARCH=amd64 go build -o qenvaro-backend .

# Local: push to VPS
scp qenvaro-backend <user>@<vps-ip>:/tmp/qenvaro-backend

# VPS:
mv /tmp/qenvaro-backend /opt/qenvaro/backend/qenvaro-backend
chown qenvaro:qenvaro /opt/qenvaro/backend/qenvaro-backend
chmod +x /opt/qenvaro/backend/qenvaro-backend
systemctl restart qenvaro
systemctl status qenvaro
```
