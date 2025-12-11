# User Documentation

*Inception Project - User Guide*

## Table of Contents

1. [Introduction](#introduction)
2. [Services Overview](#services-overview)
3. [Starting and Stopping the Project](#starting-and-stopping-the-project)
4. [Accessing Services](#accessing-services)
5. [Managing Credentials](#managing-credentials)
6. [Health Checks and Monitoring](#health-checks-and-monitoring)
7. [Common Operations](#common-operations)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to the Inception project! This infrastructure provides a complete web hosting platform with multiple services running in isolated Docker containers. This guide will help you understand, manage, and use the platform effectively.

**What is this?**  
A containerized web infrastructure that includes:
- A secure WordPress website
- Database management
- File transfer capabilities
- System monitoring
- Additional web services

**Who is this for?**  
- End users who want to publish content on WordPress
- Administrators managing the infrastructure
- Anyone who needs to interact with the services

---

## Services Overview

The platform provides the following services:

### Core Services

| Service | Purpose | Access |
|---------|---------|--------|
| **WordPress** | Content Management System for creating and managing website content | `https://your-domain.42.fr` |
| **Nginx** | Web server handling HTTPS requests securely | Automatically handles web traffic |
| **MariaDB** | Database storing all WordPress data | Internal only (no direct access) |

### Additional Services

| Service | Purpose | Access |
|---------|---------|--------|
| **Redis** | Caching system for faster website performance | Internal only |
| **Adminer** | Web interface for database administration | `http://localhost:8080` |
| **FTP Server** | File transfer for uploading/downloading files | `ftp://localhost:21` |
| **Static Website** | Additional website for portfolio or landing page | `http://localhost:9999` |
| **Monitor Dashboard** | Real-time system monitoring interface | `http://localhost:5000` |

---

## Starting and Stopping the Project

### Starting the Project

**Method 1: Using Make (Recommended)**
```bash
make
```

This single command will:
- Create necessary data directories
- Build all Docker images
- Start all services in the background
- Configure networking between services

**Method 2: Using Docker Compose Directly**
```bash
docker compose -f srcs/docker-compose.yml up -d
```

**What to expect:**
- The first start may take 2-5 minutes as Docker builds all images
- Subsequent starts are much faster (30-60 seconds)
- Services start automatically when the system boots

### Stopping the Project

**Method 1: Stop services (keeps data)**
```bash
make down
```
This stops all containers but preserves your data (database, files, uploads).

**Method 2: Complete cleanup (removes everything)**
```bash
make fclean
```
⚠️ **Warning**: This deletes ALL data including database, uploads, and files. Use only if you want to start fresh.

### Checking Service Status

To see if services are running:
```bash
docker ps
```

You should see containers for:
- nginx
- wordpress
- mariadb
- redis
- adminer
- ftp
- static_website
- monitor

---

## Accessing Services

### WordPress Website

**URL**: `https://your-domain.42.fr`

**First-time setup:**
1. Open your browser
2. Navigate to `https://your-domain.42.fr`
3. Accept the security warning (self-signed certificate)
4. You'll see the WordPress homepage

**Logging in:**
- Click "Log In" or navigate to `https://your-domain.42.fr/wp-admin`
- Use your admin credentials (see [Managing Credentials](#managing-credentials))

### WordPress Administration Panel

**URL**: `https://your-domain.42.fr/wp-admin`

**What you can do:**
- Create and publish posts and pages
- Upload media (images, videos, documents)
- Install themes and plugins
- Manage users and comments
- Configure site settings
- View site statistics

### Adminer (Database Management)

**URL**: `http://localhost:8080`

**Login details:**
- **System**: MySQL
- **Server**: `mariadb` (container name)
- **Username**: Your database username (from .env)
- **Password**: Your database password (from .env)
- **Database**: `wordpress`

**What you can do:**
- View database tables and data
- Execute SQL queries
- Export/import database
- Manage database structure

### FTP Server

**Connection details:**
- **Host**: `localhost` or `127.0.0.1`
- **Port**: `21`
- **Username**: Your FTP username (from .env)
- **Password**: Your FTP password (from .env)
- **Protocol**: FTP (not FTPS or SFTP)

**Using FTP clients:**

*FileZilla:*
1. Open FileZilla
2. Enter host, username, password, and port
3. Click "Quickconnect"
4. Navigate to WordPress files in `/home/your-ftp-user/ftp`

*Command line:*
```bash
ftp localhost
# Enter username and password when prompted
```

**What you can do:**
- Upload files directly to WordPress
- Download backups
- Manage uploaded media
- Edit theme files (advanced users)

### Static Website

**URL**: `http://localhost:9999`

A custom HTML/CSS/JavaScript website for portfolios, landing pages, or documentation.

### Monitor Dashboard

**URL**: `http://localhost:5000`

**What you can see:**
- Running containers and their status
- Resource usage (CPU, memory)
- Service health information
- Container logs (if implemented)

---

## Managing Credentials

### Where Credentials Are Stored

All sensitive credentials are stored in the `.env` file located at `srcs/.env`.

⚠️ **Security Note**: Never share this file or commit it to version control!

### Understanding the .env File

```bash
# Domain Configuration
DOMAIN_NAME=your-domain.42.fr

# Database Credentials
MYSQL_ROOT_PASSWORD=strong-root-password
MYSQL_DATABASE=wordpress
MYSQL_USER=wp-user
MYSQL_PASSWORD=database-password

# WordPress Admin Account
WP_ADMIN_USER=admin
WP_ADMIN_PASSWORD=admin-password
WP_ADMIN_EMAIL=admin@example.com

# WordPress Regular User
WP_USER=editor
WP_USER_PASSWORD=user-password
WP_USER_EMAIL=editor@example.com

# FTP Access
FTP_USER=ftpuser
FTP_PASSWORD=ftp-password
```

### Credential Types

**1. WordPress Admin Credentials**
- Used for: Full WordPress administration
- Variables: `WP_ADMIN_USER`, `WP_ADMIN_PASSWORD`
- Access level: Complete control

**2. WordPress Regular User**
- Used for: Content creation without admin privileges
- Variables: `WP_USER`, `WP_USER_PASSWORD`
- Access level: Editor role

**3. Database Credentials**
- Used for: Adminer and direct database access
- Variables: `MYSQL_USER`, `MYSQL_PASSWORD`
- Access level: WordPress database only

**4. Database Root Password**
- Used for: Complete database administration
- Variable: `MYSQL_ROOT_PASSWORD`
- Access level: All databases

**5. FTP Credentials**
- Used for: File transfer access
- Variables: `FTP_USER`, `FTP_PASSWORD`
- Access level: WordPress files directory

### Changing Credentials

⚠️ **Important**: Changing credentials after initial setup requires recreating the containers.

**Steps to change credentials:**

1. Stop all services:
   ```bash
   make down
   ```

2. Edit the `.env` file:
   ```bash
   nano srcs/.env
   # or
   vim srcs/.env
   ```

3. Change desired passwords

4. Remove old data (⚠️ deletes everything):
   ```bash
   make fclean
   ```

5. Start fresh with new credentials:
   ```bash
   make
   ```

### Password Best Practices

- ✅ Use at least 12 characters
- ✅ Mix uppercase, lowercase, numbers, and symbols
- ✅ Use unique passwords for each service
- ✅ Don't use common words or patterns
- ❌ Don't share passwords
- ❌ Don't write passwords in plain text outside .env

---

## Health Checks and Monitoring

### Checking Service Status

**Quick status check:**
```bash
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE                    STATUS
abc123...      nginx:hmrabet            Up 2 hours
def456...      wordpress:hmrabet        Up 2 hours
ghi789...      mariadb:hmrabet          Up 2 hours
...
```

All containers should show `Up` status.

### Individual Service Checks

**Check WordPress:**
```bash
curl -k https://your-domain.42.fr
```
Should return HTML content.

**Check Adminer:**
```bash
curl http://localhost:8080
```
Should return Adminer login page.

**Check Monitor:**
```bash
curl http://localhost:5000
```
Should return monitoring dashboard.

### Viewing Service Logs

**View logs for a specific service:**
```bash
docker logs nginx
docker logs wordpress
docker logs mariadb
```

**Follow logs in real-time:**
```bash
docker logs -f wordpress
```
Press `Ctrl+C` to stop following.

**View last 50 lines:**
```bash
docker logs --tail 50 nginx
```

### Common Health Indicators

**✅ Healthy signs:**
- All containers show `Up` status
- WordPress loads without errors
- Can log into WordPress admin
- Adminer connects to database
- No error messages in logs

**⚠️ Warning signs:**
- Container status shows `Restarting`
- Slow page load times
- Occasional connection errors
- Warning messages in logs

**❌ Problem indicators:**
- Container status shows `Exited`
- Cannot access services
- Error 502/503 on website
- "Connection refused" messages
- Error messages in logs

### Using the Monitor Dashboard

1. Open `http://localhost:5000` in your browser
2. View real-time status of all containers
3. Check resource usage
4. Identify which services need attention

---

## Common Operations

### Publishing Content on WordPress

1. Log into WordPress admin: `https://your-domain.42.fr/wp-admin`
2. Click "Posts" → "Add New" or "Pages" → "Add New"
3. Write your content using the block editor
4. Add images by clicking the "+" button → "Image"
5. Click "Publish" when ready

### Uploading Files via FTP

1. Connect to FTP server (see [FTP Server](#ftp-server))
2. Navigate to `/home/your-ftp-user/ftp/wp-content/uploads`
3. Upload your files
4. Files are immediately available in WordPress media library

### Backing Up Your Data

**Manual backup:**
```bash
# Backup WordPress files
cp -r /home/$USER/data/wordpress ~/backup-wordpress-$(date +%Y%m%d)

# Backup database
cp -r /home/$USER/data/mariadb ~/backup-mariadb-$(date +%Y%m%d)
```

**Using Adminer to export database:**
1. Log into Adminer at `http://localhost:8080`
2. Click "Export" in the left menu
3. Select "SQL" format
4. Click "Export" button
5. Save the .sql file

### Restarting Services

**Restart all services:**
```bash
make down
make
```

**Restart a single service:**
```bash
docker restart wordpress
```

### Viewing Resource Usage

```bash
docker stats
```
Shows real-time CPU, memory, and network usage for all containers.

---

## Troubleshooting

### Cannot Access WordPress

**Problem**: Browser shows "Connection refused" or "Cannot connect"

**Solutions:**
1. Check if services are running: `docker ps`
2. If containers are down: `make`
3. Wait 60 seconds for services to fully start
4. Check logs: `docker logs nginx` and `docker logs wordpress`

### "Your connection is not private" Warning

**Problem**: Browser security warning when accessing HTTPS

**Solution**: This is expected with self-signed certificates.
- Click "Advanced" → "Proceed to site"
- Or use your domain instead of localhost

### WordPress Shows "Error establishing database connection"

**Problem**: WordPress cannot connect to database

**Solutions:**
1. Wait 2 minutes (MariaDB may still be initializing)
2. Check if MariaDB is running: `docker ps | grep mariadb`
3. Restart services: `make down && make`
4. Check database logs: `docker logs mariadb`

### Cannot Log Into WordPress Admin

**Problem**: Wrong username or password

**Solutions:**
1. Check credentials in `srcs/.env` file
2. Use the `WP_ADMIN_USER` and `WP_ADMIN_PASSWORD` values
3. If credentials were changed, recreate containers: `make fclean && make`

### FTP Connection Fails

**Problem**: Cannot connect via FTP

**Solutions:**
1. Check if FTP container is running: `docker ps | grep ftp`
2. Verify credentials in `srcs/.env` (use `FTP_USER` and `FTP_PASSWORD`)
3. Check port 21 is not blocked by firewall
4. Use passive mode in your FTP client
5. Check logs: `docker logs ftp`

### Adminer Cannot Connect to Database

**Problem**: "Access denied" or connection error

**Solutions:**
1. Ensure you use `mariadb` as the server name (not `localhost`)
2. Use credentials from `srcs/.env`: `MYSQL_USER` and `MYSQL_PASSWORD`
3. Select "MySQL" as the system
4. Database name should be `wordpress`

### Services Keep Restarting

**Problem**: Containers show `Restarting` status

**Solutions:**
1. View logs to identify error: `docker logs <container-name>`
2. Check if ports are already in use: `lsof -i :443` or `lsof -i :3306`
3. Verify `.env` file is properly configured
4. Recreate containers: `make fclean && make`

### Website is Very Slow

**Problem**: Pages take a long time to load

**Solutions:**
1. Check if Redis is running: `docker ps | grep redis`
2. View resource usage: `docker stats`
3. Restart WordPress: `docker restart wordpress`
4. Clear browser cache
5. Check disk space: `df -h`

### "Port already in use" Error

**Problem**: Cannot start services due to port conflict

**Solutions:**
1. Find process using the port: `lsof -i :443` (replace 443 with your port)
2. Stop the conflicting service or change port in docker-compose.yml
3. Common conflicts: Nginx/Apache on port 443, MySQL on 3306

---

## Quick Reference

### Essential Commands

```bash
# Start everything
make

# Stop everything (keeps data)
make down

# View running services
docker ps

# View service logs
docker logs <service-name>

# Restart a service
docker restart <service-name>

# View resource usage
docker stats
```

### Service URLs

- WordPress: `https://your-domain.42.fr`
- WordPress Admin: `https://your-domain.42.fr/wp-admin`
- Adminer: `http://localhost:8080`
- Monitor: `http://localhost:5000`
- Static Site: `http://localhost:9999`
- FTP: `ftp://localhost:21`

### Getting Help

If you encounter issues not covered in this guide:

1. Check service logs: `docker logs <service-name>`
2. Review the main README.md for technical details
3. Consult the developer documentation (DEV_DOC.md)
4. Verify your `.env` configuration
5. Try recreating from scratch: `make fclean && make`
