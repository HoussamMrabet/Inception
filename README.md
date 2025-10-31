# Inception — 1337 School Project

This repository contains a Docker-based multi-service project built for the 1337 school "Inception" assignment. It demonstrates how to build and orchestrate a simple web stack with optional bonus services (static site, adminer, monitor, redis, ftp). The goal of this README is educational: to explain what each service does, how Docker and Docker Compose work, and some related networking and tooling concepts useful when studying the project.

## Quick summary / contract

- Inputs: Docker + docker-compose files under `srcs/` and service Dockerfiles in `srcs/requirements/*`.
- Outputs: A multi-container environment exposing web services (nginx/WordPress, static website, monitor, adminer, etc.).
- Success criteria: Containers build and run via `docker-compose`, services reachable on configured host ports.
- Error modes: missing environment variables in `.env`, ports already in use, or missing host binaries (Docker). See troubleshooting below.

---

## What this repo contains

Top-level files and folders you'll want to inspect:

- `srcs/docker-compose.yml` — orchestration of the services
- `srcs/requirements/*` — Dockerfiles and per-service config (nginx, mariadb, wordpress, etc.)
- `docs/screenshots/` — intended location for screenshots (place `static_website.png` and `monitor.png` here)

Important services (from `docker-compose.yml`):

- `mariadb` — database for WordPress
- `wordpress` — WordPress site (depends on mariadb and redis)
- `nginx` — reverse proxy and TLS termination (exposes 443:443)
- `static_website` — bonus simple static site (host port 9999)
- `adminer` — bonus DB admin UI (host port 8080)
- `monitor` — bonus monitoring web app (host port 5000)
- `redis` — bonus caching service
- `ftp` — bonus FTP server and passive port range

Note: static_website, adminer, monitor, redis and ftp are included as bonus services in this project.

---

## Quick start

Prerequisites: Docker Engine and Docker Compose (or Docker Desktop that includes Compose).

Build and run the stack from the repository root:

```bash
cd srcs
docker-compose up -d --build
```

Check containers:

```bash
docker-compose ps
```

Common access URLs (default ports as configured in `srcs/docker-compose.yml`):

- Static website: http://localhost:9999
- Monitor UI: http://localhost:5000
- Adminer: http://localhost:8080
- nginx (HTTPS): https://localhost (443)

To stop the stack:

```bash
docker-compose down
```

---

## Educational explanations

### How Docker and Docker Compose work

Docker is a container runtime that lets you package an application and its dependencies into a lightweight, isolated user-space called a container. A Docker image is a snapshot (read-only) built from a series of filesystem layers; a container is a running instance of an image.

Docker Compose is a tool for defining and running multi-container Docker applications using a single YAML file (`docker-compose.yml`). Compose lets you define services, networks, volumes, and dependencies so you can start the entire stack with a single command (`docker-compose up`). Compose manages container lifecycle (build, run, stop) and wiring (networks and volumes) for you.

Key idea: Docker builds images (repeatable artifacts). Compose uses those images to create a coordinated set of containers with specific configuration (environment variables, exposed ports, volumes, networks, service order).


### Difference between using a Docker image with and without Docker Compose

- Without Compose: You run a single container manually with `docker run`, passing flags for port mapping, volumes, environment vars, and networks. This is fine for simple, single-container use.

- With Compose: You define several services and their relationships in `docker-compose.yml`. Compose automates multi-container start-up (including dependency order), sets up a private network, and reuses named volumes. Compose is better for reproducibility and for coordinating multiple services (e.g., a web app + DB + cache).

In short: The image is the same artifact either way. Compose provides orchestration and configuration convenience on top of images.


### Benefit of Docker compared to Virtual Machines (VMs)

- Lightweight: Containers share the host kernel and have much smaller size compared to full VM images (no guest OS per container).
- Faster startup: Containers start in milliseconds to seconds, VMs take longer due to booting a full OS.
- Resource efficiency: Containers isolate applications but allow denser packing on the same host.
- Portability: A container image bundles your app and dependencies and runs the same across different hosts with Docker installed.

Trade-offs: containers share the kernel with the host, so kernel-level isolation differs from full hardware virtualization provided by VMs. For some workloads or stronger isolation, VMs or a combination (VM + containers) are used.


### Simple explanation of Docker networks

Docker networks connect containers so they can communicate. Compose automatically creates a default network for the services in a compose project. Containers on the same network can reach each other by container name as a hostname. There are several network drivers:

- bridge (default): a private internal network on the host. Containers communicate through the bridge. Use for standalone deployments on a single host.
- host: the container uses the host network stack (no network isolation).
- overlay: used for multi-host networking (Swarm or other orchestrators).

In this repo, Compose creates an internal network (named `inception` in `docker-compose.yml`). Services talk to each other by name (e.g., `wordpress` can reach `mariadb` at hostname `mariadb`). To expose services to your host machine, `ports` mappings are used (e.g., `9999:9999`).

---

## Project components explained

### Nginx (reverse proxy, TLS)

Nginx is a high-performance HTTP server and reverse proxy. In this project it sits in front of the WordPress container, forwarding incoming requests to the appropriate backend and terminating TLS/SSL. TLS (Transport Layer Security) provides encryption between clients and the server. To enable TLS you need X.509 certificates (public+private key). In local development you may generate self-signed certificates for testing; browsers will show a warning unless the certificate is signed by a trusted CA.

Key responsibilities of nginx in the stack:
- Serve static assets if needed
- Proxy requests to WordPress
- Handle HTTPS (TLS term)
- Optionally redirect HTTP to HTTPS


### WordPress

WordPress is a PHP-based CMS. It needs a database (MariaDB/MySQL). The WordPress container serves the PHP application and stores uploaded files in a volume so data persists across container restarts.

Important configuration points:
- Database credentials via environment variables
- Persistent volume for WordPress files (`/var/www/html`)
- Proper ownership/permissions so PHP can write uploaded files


### Redis

Redis is an in-memory key-value store useful for caching. WordPress can use Redis as a persistent page/object cache to improve performance by avoiding repeated database queries. Redis runs as its own service and other services connect to it via the Docker network.


### FTP

FTP is used here as a bonus service to practice binding volumes and configuring passive ports. FTP is an older protocol with plaintext credentials unless wrapped in TLS (FTPS). For many modern workflows, SFTP (SSH File Transfer Protocol) is preferred.


### Adminer

Adminer is a lightweight database management web UI similar to phpMyAdmin. It makes it easy to inspect the MariaDB database from the browser.


### Static website — Tic Tac Toe (bonus)

- The `static_website` service hosts a client-side Tic Tac Toe game implemented in vanilla JavaScript (see `srcs/requirements/bonus/static_website/app/`).
- Features: interactive 3x3 board, optional AI opponent, local score saving via localStorage, simple animations and responsive UI. The game is served as static files and demonstrates building and serving static content from a container (host port `9999` by default).

### Monitor — Flask-based health checker (bonus)

- The `monitor` service is a small Flask web application that continuously checks other services and presents a dashboard (see `srcs/requirements/bonus/monitor/app/`). It was added as the project's custom bonus service.
- Key behavior (implementation highlights):
	- On startup the monitor waits ~60s to allow other containers to come up, then performs an initial check and starts a scheduler.
	- Uses the `schedule` library to run `monitor_all_targets` every 30 seconds.
	- Monitoring targets are defined in `MONITORING_TARGETS` (examples include the WordPress site via nginx, Adminer, and the static website). You can add or change entries there to monitor other endpoints.
	- For each check the monitor records timestamp, status (`up`, `warning`, `down`), HTTP response code, response time, and any error text.
	- Results are appended to an in-container JSON file at `/app/data/monitoring.json` (the monitor keeps bounded history for checks and alerts).
	- When a service is not responding as expected, the monitor generates an alert object (with service name, timestamp, message and severity) and stores it in `monitoring_data['alerts']`.
	- The app exposes a simple dashboard at `/` and two JSON endpoints used by the UI:
		- `/api/status` — returns `summary` (per-service stats), recent checks and recent alerts.
		- `/api/health` — basic health/metadata about the monitor itself.
	- The dashboard fetches `/api/status` periodically and shows per-service uptime, average response time, last error and a recent alerts list.

This monitor is useful for quickly detecting failing containers and surface information about what failed (timeout, connection error, unexpected status code). It's intentionally lightweight and easy to extend for additional checks or alerting (e.g., email/webhook integrations).

---

## Troubleshooting & tips

- If environment variables are missing, check `.env` in the `srcs/` directory (compose uses `env_file: .env`).
- If ports conflict, change the host-side port mapping in `srcs/docker-compose.yml`.
- If containers fail to build, inspect logs with `docker-compose logs --tail=100 <service>`.
- Never commit secrets like private TLS keys or database passwords to the git repository. Use a `.env` excluded from version control.

---

## Where to look in the repo

- `srcs/docker-compose.yml` — main orchestration file
- `srcs/requirements/*` — services and Dockerfiles (nginx, wordpress, mariadb, bonus services)
- `srcs/requirements/bonus/*` — bonus services: `static_website`, `adminer`, `monitor`, `redis`, `ftp`
