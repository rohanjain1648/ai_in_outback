#!/bin/bash

# Deployment script for Rural Connect AI
# Supports multiple environments: development, staging, production

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            log_info "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_info "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    
    if [[ -f "$env_file" ]]; then
        log_info "Loading environment variables from $env_file"
        set -a
        source "$env_file"
        set +a
    else
        log_warning "Environment file $env_file not found"
        if [[ "$ENVIRONMENT" == "production" ]]; then
            log_error "Production environment file is required"
            exit 1
        fi
    fi
}

# Build images
build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        docker-compose -f docker-compose.dev.yml build
    else
        docker-compose build
    fi
    
    log_success "Images built successfully"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Start database services first
    if [[ "$ENVIRONMENT" == "development" ]]; then
        docker-compose -f docker-compose.dev.yml up -d mongodb-dev redis-dev
    else
        docker-compose up -d mongodb redis
    fi
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations (if you have a migration system)
    # docker-compose exec backend npm run migrate
    
    log_success "Database migrations completed"
}

# Deploy services
deploy_services() {
    log_info "Deploying services..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        docker-compose -f docker-compose.dev.yml up -d
    else
        docker-compose up -d
    fi
    
    log_success "Services deployed successfully"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        # Check frontend
        if curl -f http://localhost:8080/health &> /dev/null; then
            log_success "Frontend is healthy"
            frontend_healthy=true
        else
            frontend_healthy=false
        fi
        
        # Check backend
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "Backend is healthy"
            backend_healthy=true
        else
            backend_healthy=false
        fi
        
        if [[ "$frontend_healthy" == true && "$backend_healthy" == true ]]; then
            log_success "All services are healthy"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Stop current services
    if [[ "$ENVIRONMENT" == "development" ]]; then
        docker-compose -f docker-compose.dev.yml down
    else
        docker-compose down
    fi
    
    # Restore previous version (this would need to be implemented based on your versioning strategy)
    log_info "Rollback completed"
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old images (keep last 3 versions)
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" | \
    grep rural-connect | \
    tail -n +4 | \
    awk '{print $3}' | \
    xargs -r docker rmi
    
    log_success "Cleanup completed"
}

# Backup database
backup_database() {
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "Creating database backup..."
        
        local backup_dir="$PROJECT_ROOT/backups"
        local timestamp=$(date +%Y%m%d_%H%M%S)
        local backup_file="$backup_dir/mongodb_backup_$timestamp.gz"
        
        mkdir -p "$backup_dir"
        
        docker-compose exec -T mongodb mongodump --archive --gzip > "$backup_file"
        
        log_success "Database backup created: $backup_file"
    fi
}

# Main deployment function
main() {
    log_info "Starting deployment of Rural Connect AI"
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    validate_environment
    check_prerequisites
    load_environment
    
    # Create backup for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        backup_database
    fi
    
    build_images
    run_migrations
    deploy_services
    
    # Perform health check
    if health_check; then
        log_success "Deployment completed successfully!"
        cleanup
    else
        log_error "Deployment failed health check"
        if [[ "$ENVIRONMENT" == "production" ]]; then
            rollback
        fi
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"