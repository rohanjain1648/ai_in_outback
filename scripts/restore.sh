#!/bin/bash

# Restore Script for Rural Connect AI
# Restores database, files, and configurations from backup

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
BACKUP_TIMESTAMP=${1}

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

# Show usage
show_usage() {
    echo "Usage: $0 <backup_timestamp>"
    echo "Example: $0 20231201_143022"
    echo ""
    echo "Available backups:"
    if [[ -d "$BACKUP_DIR" ]]; then
        find "$BACKUP_DIR" -name "backup_metadata_*.json" | sed 's/.*backup_metadata_\(.*\)\.json/  \1/' | sort -r
    else
        echo "  No backups found in $BACKUP_DIR"
    fi
}

# Validate backup timestamp
validate_backup() {
    if [[ -z "$BACKUP_TIMESTAMP" ]]; then
        log_error "Backup timestamp is required"
        show_usage
        exit 1
    fi
    
    local metadata_file="$BACKUP_DIR/backup_metadata_$BACKUP_TIMESTAMP.json"
    if [[ ! -f "$metadata_file" ]]; then
        log_error "Backup metadata not found: $metadata_file"
        show_usage
        exit 1
    fi
    
    log_info "Found backup metadata: $metadata_file"
    
    # Display backup information
    if command -v jq &> /dev/null; then
        log_info "Backup information:"
        jq -r '"Date: " + .date + "\nEnvironment: " + .environment + "\nVersion: " + .version' "$metadata_file"
    fi
}

# Confirm restore operation
confirm_restore() {
    log_warning "This operation will restore data from backup timestamp: $BACKUP_TIMESTAMP"
    log_warning "Current data will be replaced. This action cannot be undone."
    
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore operation cancelled"
        exit 0
    fi
}

# Stop services
stop_services() {
    log_info "Stopping services..."
    
    cd "$PROJECT_ROOT"
    
    # Stop all services
    docker-compose down
    
    log_success "Services stopped"
}

# Start database services
start_database_services() {
    log_info "Starting database services..."
    
    cd "$PROJECT_ROOT"
    
    # Start only database services
    docker-compose up -d mongodb redis elasticsearch
    
    # Wait for services to be ready
    sleep 30
    
    log_success "Database services started"
}

# Restore MongoDB database
restore_mongodb() {
    log_info "Restoring MongoDB database..."
    
    local backup_file="$BACKUP_DIR/database/mongodb_$BACKUP_TIMESTAMP.gz"
    
    if [[ ! -f "$backup_file" ]]; then
        log_warning "MongoDB backup file not found: $backup_file"
        return 0
    fi
    
    # Drop existing database
    docker-compose exec -T mongodb mongosh --eval "db.dropDatabase()" rural-connect-ai
    
    # Restore from backup
    docker-compose exec -T mongodb mongorestore --archive --gzip < "$backup_file"
    
    if [[ $? -eq 0 ]]; then
        log_success "MongoDB database restored successfully"
    else
        log_error "MongoDB restore failed"
        return 1
    fi
}

# Restore Redis data
restore_redis() {
    log_info "Restoring Redis data..."
    
    local backup_file="$BACKUP_DIR/database/redis_$BACKUP_TIMESTAMP.rdb"
    
    if [[ ! -f "$backup_file" ]]; then
        log_warning "Redis backup file not found: $backup_file"
        return 0
    fi
    
    # Stop Redis service
    docker-compose stop redis
    
    # Copy backup file to Redis container
    docker cp "$backup_file" $(docker-compose ps -q redis):/data/dump.rdb
    
    # Start Redis service
    docker-compose start redis
    
    # Wait for Redis to load data
    sleep 10
    
    if [[ $? -eq 0 ]]; then
        log_success "Redis data restored successfully"
    else
        log_error "Redis restore failed"
        return 1
    fi
}

# Restore files
restore_files() {
    log_info "Restoring files..."
    
    local files_backup="$BACKUP_DIR/files/files_$BACKUP_TIMESTAMP.tar.gz"
    
    if [[ ! -f "$files_backup" ]]; then
        log_warning "Files backup not found: $files_backup"
        return 0
    fi
    
    # Extract files to project root
    cd "$PROJECT_ROOT"
    tar -xzf "$files_backup"
    
    if [[ $? -eq 0 ]]; then
        log_success "Files restored successfully"
    else
        log_error "Files restore failed"
        return 1
    fi
}

# Restore configurations
restore_configs() {
    log_info "Restoring configurations..."
    
    local config_backup="$BACKUP_DIR/configs/configs_$BACKUP_TIMESTAMP.tar.gz"
    
    if [[ ! -f "$config_backup" ]]; then
        log_warning "Configuration backup not found: $config_backup"
        return 0
    fi
    
    # Create backup of current configs
    local current_config_backup="$PROJECT_ROOT/configs_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$current_config_backup" \
        docker-compose.yml \
        docker-compose.dev.yml \
        .env.* \
        nginx*.conf \
        monitoring/ \
        logging/ \
        scripts/ 2>/dev/null || true
    
    log_info "Current configurations backed up to: $current_config_backup"
    
    # Extract configuration files
    cd "$PROJECT_ROOT"
    tar -xzf "$config_backup"
    
    if [[ $? -eq 0 ]]; then
        log_success "Configurations restored successfully"
    else
        log_error "Configuration restore failed"
        return 1
    fi
}

# Start all services
start_all_services() {
    log_info "Starting all services..."
    
    cd "$PROJECT_ROOT"
    
    # Start all services
    docker-compose up -d
    
    # Wait for services to be ready
    sleep 60
    
    log_success "All services started"
}

# Verify restore
verify_restore() {
    log_info "Verifying restore..."
    
    local verification_failed=false
    
    # Check if services are running
    local services=("frontend" "backend" "mongodb" "redis")
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "$service is running"
        else
            log_error "$service is not running"
            verification_failed=true
        fi
    done
    
    # Check database connectivity
    if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" rural-connect-ai &>/dev/null; then
        log_success "MongoDB connectivity verified"
    else
        log_error "MongoDB connectivity failed"
        verification_failed=true
    fi
    
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis connectivity verified"
    else
        log_error "Redis connectivity failed"
        verification_failed=true
    fi
    
    # Check application health
    sleep 30
    if curl -f http://localhost:3000/health &>/dev/null; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        verification_failed=true
    fi
    
    if curl -f http://localhost:8080/health &>/dev/null; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        verification_failed=true
    fi
    
    if [[ "$verification_failed" == true ]]; then
        log_error "Restore verification failed"
        return 1
    else
        log_success "Restore verification passed"
    fi
}

# Send restore notification
send_notification() {
    local status=$1
    local message=$2
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        local color="good"
        if [[ "$status" != "success" ]]; then
            color="danger"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"title\":\"Rural Connect AI Restore\",\"text\":\"$message\",\"footer\":\"$(hostname)\",\"ts\":$(date +%s)}]}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
    
    if [[ -n "$EMAIL_NOTIFICATION" ]]; then
        echo "$message" | mail -s "Rural Connect AI Restore - $status" "$EMAIL_NOTIFICATION" 2>/dev/null || true
    fi
}

# Main restore function
main() {
    log_info "Starting restore process for Rural Connect AI"
    log_info "Backup timestamp: $BACKUP_TIMESTAMP"
    
    validate_backup
    confirm_restore
    
    local restore_failed=false
    
    # Stop services
    stop_services
    
    # Start database services
    start_database_services
    
    # Perform restore operations
    restore_mongodb || restore_failed=true
    restore_redis || restore_failed=true
    restore_files || restore_failed=true
    restore_configs || restore_failed=true
    
    # Start all services
    start_all_services
    
    # Verify restore
    if ! verify_restore; then
        restore_failed=true
    fi
    
    # Send notification
    if [[ "$restore_failed" == true ]]; then
        log_error "Restore process completed with errors"
        send_notification "error" "Restore process completed with errors. Backup timestamp: $BACKUP_TIMESTAMP"
        exit 1
    else
        log_success "Restore process completed successfully!"
        send_notification "success" "Restore process completed successfully. Backup timestamp: $BACKUP_TIMESTAMP"
    fi
}

# Handle script interruption
trap 'log_error "Restore process interrupted"; exit 1' INT TERM

# Check if backup timestamp is provided
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

# Run main function
main "$@"