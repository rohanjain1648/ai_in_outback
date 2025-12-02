# Deployment Guide - Rural Connect AI

This guide provides comprehensive instructions for deploying the Rural Connect AI platform across different environments.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for development)
- Git
- SSL certificates (for production)

### Development Deployment

```bash
# Clone the repository
git clone <repository-url>
cd rural-connect-ai

# Copy environment file
cp .env.example .env.development

# Deploy with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Check health
curl http://localhost:8080/health
curl http://localhost:3000/health
```

### Production Deployment

```bash
# Set up environment
cp .env.example .env.production
# Edit .env.production with your production values

# Set up SSL certificates
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com production

# Deploy
./scripts/deploy.sh production

# Or on Windows
.\scripts\deploy.ps1 -Environment production
```

## Environment Configuration

### Environment Files

Create environment-specific files:
- `.env.development` - Development settings
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Required Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://mongodb:27017/rural-connect-ai
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=redis-password

# JWT
JWT_SECRET=your-super-secure-jwt-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Monitoring
GRAFANA_PASSWORD=grafana-password
```

## Docker Deployment

### Services Overview

The platform consists of the following services:

- **Frontend**: React application with Nginx
- **Backend**: Node.js API server
- **MongoDB**: Primary database
- **Redis**: Caching and sessions
- **Elasticsearch**: Search functionality
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards
- **Fluentd**: Log aggregation

### Docker Compose Files

- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend

# Build with no cache
docker-compose build --no-cache
```

### Managing Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Scale services
docker-compose up -d --scale backend=3

# Stop services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

## SSL Configuration

### Development (Self-signed)

```bash
./scripts/setup-ssl.sh localhost admin@localhost.com development
```

### Production (Let's Encrypt)

```bash
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com production
```

### Manual SSL Setup

1. Place certificates in `./ssl/` directory:
   - `fullchain.pem` - Full certificate chain
   - `privkey.pem` - Private key
   - `dhparam.pem` - Diffie-Hellman parameters

2. Update nginx configuration to use certificates

## Monitoring and Logging

### Accessing Monitoring

- **Grafana**: http://localhost:3001 (admin/password from env)
- **Prometheus**: http://localhost:9090
- **Elasticsearch**: http://localhost:9200

### Log Locations

- Application logs: `./logs/`
- Container logs: `docker-compose logs`
- Nginx logs: Inside nginx container at `/var/log/nginx/`

### Setting Up Alerts

1. Configure Slack webhook in environment variables
2. Set up email notifications
3. Customize alert rules in `monitoring/alert_rules.yml`

## Backup and Recovery

### Creating Backups

```bash
# Manual backup
./scripts/backup.sh

# Automated backups (add to crontab)
0 2 * * * /path/to/scripts/backup.sh
```

### Restoring from Backup

```bash
# List available backups
./scripts/restore.sh

# Restore specific backup
./scripts/restore.sh 20231201_143022
```

### Backup Contents

- MongoDB database dump
- Redis data
- Uploaded files and assets
- Configuration files
- SSL certificates

## CI/CD Pipeline

### GitHub Actions

The repository includes a complete CI/CD pipeline:

1. **Test**: Run unit, integration, and E2E tests
2. **Security**: Vulnerability scanning
3. **Build**: Create Docker images
4. **Deploy**: Deploy to staging/production
5. **Monitor**: Performance testing

### Pipeline Configuration

- Workflow file: `.github/workflows/ci-cd.yml`
- Secrets required:
  - `GITHUB_TOKEN` (automatic)
  - `SLACK_WEBHOOK` (optional)
  - `LHCI_GITHUB_APP_TOKEN` (for Lighthouse CI)

### Manual Deployment

```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main
```

## Performance Optimization

### Production Optimizations

1. **Image Optimization**: Multi-stage Docker builds
2. **Caching**: Redis for API responses, Nginx for static assets
3. **Compression**: Gzip enabled for all text content
4. **CDN**: Configure CDN for global asset delivery
5. **Database**: Optimized indexes and queries

### Monitoring Performance

- Lighthouse CI for web vitals
- Prometheus metrics for system performance
- Custom performance monitoring in application

## Security Configuration

### Security Headers

Nginx is configured with security headers:
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-XSS-Protection
- Content Security Policy

### Rate Limiting

- API endpoints: 10 requests/second
- Login endpoint: 1 request/second
- Configurable in nginx configuration

### SSL Security

- TLS 1.2 and 1.3 only
- Strong cipher suites
- OCSP stapling enabled
- Perfect Forward Secrecy

## Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   docker-compose logs service-name
   ```

2. **Database connection issues**
   ```bash
   docker-compose exec mongodb mongosh
   ```

3. **SSL certificate issues**
   ```bash
   openssl x509 -in ssl/fullchain.pem -text -noout
   ```

4. **Performance issues**
   - Check Grafana dashboards
   - Review application logs
   - Monitor resource usage

### Health Checks

All services include health checks:
```bash
# Check all services
docker-compose ps

# Manual health check
curl http://localhost:8080/health
curl http://localhost:3000/health
```

### Log Analysis

```bash
# View recent logs
docker-compose logs --tail=100 -f

# Search logs
docker-compose logs | grep ERROR

# Export logs
docker-compose logs > deployment.log
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale with load balancer
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

### Database Scaling

For production scaling:
1. Set up MongoDB replica set
2. Configure Redis cluster
3. Use read replicas for heavy read workloads

### CDN and Caching

1. Configure CDN for static assets
2. Implement Redis caching for API responses
3. Use Nginx caching for frequently accessed content

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Monthly security updates
2. **Backup Verification**: Test restore procedures
3. **Certificate Renewal**: Automated with Let's Encrypt
4. **Log Rotation**: Automated with Docker
5. **Performance Review**: Monthly performance analysis

### Update Procedure

```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker-compose build

# Deploy with zero downtime
docker-compose up -d --no-deps --build service-name
```

## Support

For deployment issues:
1. Check this documentation
2. Review logs and monitoring dashboards
3. Check GitHub issues
4. Contact the development team

---

**Note**: This deployment guide assumes familiarity with Docker, Docker Compose, and basic system administration. For production deployments, consider consulting with a DevOps engineer.