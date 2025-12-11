# Inception

*This project has been created as part of the 42 curriculum by hmrabet.*

## Description

**Inception** is a system administration project focused on containerization using Docker. The goal is to create a small infrastructure composed of multiple services running in isolated Docker containers, orchestrated using Docker Compose. Each service runs in its own dedicated container built from either Debian or Alpine Linux base images.

The project implements a complete LEMP stack (Linux, Nginx, MariaDB, PHP) with WordPress as the content management system, along with several bonus services including Redis cache, FTP server, Adminer database manager, a static website, and a system monitoring dashboard.

This infrastructure demonstrates best practices in containerization, networking, volume management, and secure service configuration, all orchestrated to work seamlessly together in an isolated environment.

## Project Description

### Docker in This Project

Docker is the cornerstone technology of this project, providing lightweight containerization for each service. Unlike traditional virtualization, Docker containers share the host OS kernel while maintaining process isolation, making them more efficient and faster to deploy.

**Key advantages in this project:**
- **Isolation**: Each service (Nginx, MariaDB, WordPress, etc.) runs in its own container with minimal dependencies
- **Reproducibility**: The infrastructure can be rebuilt identically on any system supporting Docker
- **Resource Efficiency**: Containers are lightweight compared to full virtual machines
- **Scalability**: Services can be easily replicated or modified without affecting others
- **Version Control**: Infrastructure is defined as code (Dockerfiles and docker-compose.yml)

### Sources Included in the Project

The project structure follows a modular organization:

```
srcs/
├── docker-compose.yml          # Orchestration configuration
├── requirements/
│   ├── nginx/                  # Web server (HTTPS only)
│   │   ├── Dockerfile
│   │   ├── conf/              # Nginx configuration
│   │   └── tools/             # SSL certificate generation
│   ├── mariadb/               # Database server
│   │   ├── Dockerfile
│   │   └── config/            # Database initialization
│   ├── wordpress/             # PHP-FPM & WordPress
│   │   ├── Dockerfile
│   │   ├── conf/              # PHP-FPM configuration
│   │   └── tools/             # WordPress setup script
│   └── bonus/
│       ├── redis/             # Cache server
│       ├── ftp/               # FTP server
│       ├── adminer/           # Database management UI
│       ├── static_website/    # Static HTML/CSS/JS site
│       └── monitor/           # System monitoring dashboard
```

### Design Choices

**1. Base Images**: Debian 12 (Bookworm) is used as the base image for most services, providing stability and a comprehensive package ecosystem.

**2. Custom Dockerfiles**: All images are built from scratch rather than using pre-built images (except base OS), ensuring full control over the configuration and security.

**3. Service Architecture**:
   - **Nginx**: Acts as a reverse proxy handling HTTPS traffic with self-signed TLS certificates
   - **WordPress + PHP-FPM**: Separated from Nginx following best practices for PHP application deployment
   - **MariaDB**: Persistent database with automated initialization scripts
   - **Redis**: Object caching for WordPress to improve performance
   - **FTP**: Secure file transfer access to WordPress files
   - **Adminer**: Web-based database administration tool
   - **Static Website**: Demonstrates hosting multiple sites in the infrastructure
   - **Monitor**: Real-time system monitoring dashboard built with Python/Flask

**4. Network Configuration**: A custom bridge network (`inception`) isolates all services from the host and other Docker networks, with only necessary ports exposed.

**5. Volume Management**: Persistent data is stored in named volumes with bind mounts to the host filesystem, ensuring data persistence across container restarts.

### Technical Comparisons

#### Virtual Machines vs Docker

| Aspect | Virtual Machines | Docker Containers |
|--------|-----------------|-------------------|
| **Architecture** | Full OS with hypervisor | Shared kernel, isolated processes |
| **Size** | GBs (entire OS) | MBs (application + dependencies) |
| **Startup Time** | Minutes | Seconds |
| **Resource Usage** | High (dedicated resources) | Low (shared resources) |
| **Isolation** | Complete (hardware-level) | Process-level |
| **Portability** | Limited (hypervisor-dependent) | High (runs anywhere with Docker) |
| **Use Case** | Full OS isolation needed | Application deployment & microservices |

**In this project**: Docker is preferred because we need lightweight, isolated services that share the same kernel. VMs would be overkill for running a simple LEMP stack and would consume significantly more resources.

#### Secrets vs Environment Variables

| Aspect | Secrets | Environment Variables |
|--------|---------|----------------------|
| **Security** | Encrypted at rest and in transit | Stored in plaintext |
| **Storage** | External secret management | In memory or .env files |
| **Rotation** | Easy to rotate without rebuilding | Requires container restart |
| **Visibility** | Limited access control | Visible in container inspect |
| **Best For** | Passwords, API keys, certificates | Non-sensitive configuration |

**In this project**: Environment variables are used via `.env` files for configuration. For a production environment, Docker Secrets or external secret management (HashiCorp Vault, AWS Secrets Manager) would be more appropriate for sensitive data like database passwords.

#### Docker Network vs Host Network

| Aspect | Docker Network (Bridge) | Host Network |
|--------|------------------------|--------------|
| **Isolation** | Services isolated in custom network | Direct host network access |
| **Port Mapping** | Explicit port mapping required | Uses host ports directly |
| **Security** | Better (network segmentation) | Lower (exposed to host) |
| **Performance** | Slight overhead (NAT) | No overhead |
| **DNS** | Internal DNS resolution | Uses host DNS |
| **Use Case** | Multi-service apps, microservices | High-performance single service |

**In this project**: A custom bridge network (`inception`) is used to provide:
- Isolated communication between services
- Service discovery via DNS (services can reach each other by container name)
- Security through network segmentation
- Explicit control over exposed ports (only 443, 8080, 5000, 9999, and FTP ports)

#### Docker Volumes vs Bind Mounts

| Aspect | Docker Volumes | Bind Mounts |
|--------|----------------|-------------|
| **Management** | Managed by Docker | Direct host filesystem path |
| **Location** | Docker internal storage | Specified host directory |
| **Portability** | More portable | Host-dependent paths |
| **Performance** | Optimized by Docker | Native filesystem performance |
| **Backup** | Docker backup tools | Standard filesystem tools |
| **Use Case** | Database data, production | Development, config files |

**In this project**: A hybrid approach is used:
- **Named volumes with bind mounts**: Volumes are defined in docker-compose.yml but use bind mount driver options to persist to `/home/${USER}/data/`
- **Advantages**: 
  - Data persists on the host filesystem for easy backup
  - Volumes can be accessed outside Docker
  - Clear separation of data by service (mariadb/, wordpress/)
  - Compatible with Docker volume commands while maintaining host access

This configuration provides the best of both worlds: Docker's volume management with direct host filesystem access.

## Instructions

### Prerequisites

- **Docker Engine** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Make** utility
- **Linux environment** (or WSL2 on Windows)
- At least 4GB of free RAM
- At least 10GB of free disk space

### Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Inception
   ```

2. Create a `.env` file in the `srcs/` directory with the following variables:
   ```bash
   # Domain Configuration
   DOMAIN_NAME=<your-domain>.42.fr
   
   # MariaDB Configuration
   MYSQL_ROOT_PASSWORD=<strong-root-password>
   MYSQL_DATABASE=wordpress
   MYSQL_USER=<wp-user>
   MYSQL_PASSWORD=<strong-password>
   
   # WordPress Configuration
   WP_TITLE=<your-site-title>
   WP_ADMIN_USER=<admin-username>
   WP_ADMIN_PASSWORD=<strong-admin-password>
   WP_ADMIN_EMAIL=<admin-email>
   WP_USER=<regular-user>
   WP_USER_EMAIL=<user-email>
   WP_USER_PASSWORD=<user-password>
   
   # FTP Configuration
   FTP_USER=<ftp-username>
   FTP_PASSWORD=<ftp-password>
   ```

3. Update your `/etc/hosts` file to resolve your domain locally:
   ```bash
   sudo echo "127.0.0.1 <your-domain>.42.fr" >> /etc/hosts
   ```

### Compilation and Execution

The project uses a Makefile for easy management:

```bash
# Build and start all services
make

# Stop all services (keeps volumes)
make down

# Clean all services and volumes
make clean

# Complete cleanup (removes images and all data)
make fclean

# Rebuild everything from scratch
make re
```

### Accessing Services

Once running, access the services at:

- **WordPress**: `https://<your-domain>.42.fr`
- **Adminer** (Database Manager): `http://localhost:8080`
- **Static Website**: `http://localhost:9999`
- **Monitor Dashboard**: `http://localhost:5000`
- **FTP Server**: `ftp://localhost:21` (credentials from .env)

### Verification

To verify all services are running correctly:

```bash
# Check running containers
docker ps

# Check service logs
docker logs <container-name>

# Check network connectivity
docker network inspect inception

# Check volumes
docker volume ls
```

### Troubleshooting

**Services not starting:**
- Check logs: `docker logs <container-name>`
- Verify `.env` file configuration
- Ensure ports are not already in use

**Connection refused:**
- Wait for all services to initialize (especially MariaDB)
- Check service dependencies in docker-compose.yml

**Permission errors:**
- Ensure data directories exist: `/home/${USER}/data/wordpress` and `/home/${USER}/data/mariadb`
- Check directory permissions

## Resources

### Docker Documentation
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Networking](https://docs.docker.com/network/)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)

### Service-Specific Resources
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MariaDB Documentation](https://mariadb.com/kb/en/documentation/)
- [WordPress Documentation](https://wordpress.org/documentation/)
- [PHP-FPM Configuration](https://www.php.net/manual/en/install.fpm.php)
- [Redis Documentation](https://redis.io/documentation)
- [WP-CLI Handbook](https://wp-cli.org/)

### Tutorials and Articles
- [Understanding Docker Containers vs VMs](https://www.docker.com/resources/what-container/)
- [Docker Compose Networking Tutorial](https://docs.docker.com/compose/networking/)
- [Securing Nginx with SSL](https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/)
- [WordPress Performance with Redis](https://developer.wordpress.org/advanced-administration/performance/object-cache/)

### AI Usage in This Project

**AI tools were used for the following tasks:**

1. **Documentation and Research**:
   - Understanding Docker networking concepts and best practices
   - Researching optimal configurations for Nginx, MariaDB, and PHP-FPM
   - Learning about Docker Compose syntax and volume management options

2. **Configuration Optimization**:
   - Generating initial configuration templates for Nginx and PHP-FPM
   - Debugging service connection issues between containers
   - Optimizing Dockerfile instructions for smaller image sizes

3. **Script Development**:
   - Assisting with shell script logic for service initialization
   - Generating SQL initialization scripts for MariaDB
   - Creating Python code for the monitoring dashboard

4. **Troubleshooting**:
   - Diagnosing container startup failures and networking issues
   - Resolving permission problems with volume mounts
   - Debugging WordPress and Redis integration

**Parts implemented independently:**
- Overall infrastructure architecture and service design
- Security configurations and network topology
- Custom monitoring dashboard UI/UX
- FTP server configuration and integration
- Project-specific business logic and requirements implementation

**AI Impact**: AI tools significantly accelerated the learning curve for Docker-specific syntax and configurations, allowing more focus on architecture and design decisions rather than syntax lookup. However, all configurations were manually reviewed, tested, and adapted to meet project requirements.

## Features

### Mandatory Services
- ✅ **Nginx**: HTTPS-only web server with TLS 1.2/1.3
- ✅ **WordPress + PHP-FPM**: Full CMS installation with WP-CLI
- ✅ **MariaDB**: Persistent database with automated setup

### Bonus Services
- ✅ **Redis**: Object caching for WordPress performance
- ✅ **FTP Server**: Secure file access to WordPress directory
- ✅ **Adminer**: Web-based database administration
- ✅ **Static Website**: Custom HTML/CSS/JS portfolio site
- ✅ **Monitor Dashboard**: Real-time container monitoring with Python/Flask

### Infrastructure Features
- Secure isolated network with service discovery
- Persistent data storage with bind-mounted volumes
- Automatic container restart on failure
- One-command deployment with Makefile
- Comprehensive logging for all services
- Custom domain support with SSL certificates

## License

This project is part of the 42 School curriculum and is intended for educational purposes.

## Author

**hmrabet** - 1337 Khouribga Student
