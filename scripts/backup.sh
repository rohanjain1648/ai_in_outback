#!/bin/bash

# Backup Script for Rural Connect AI
# Creates backups of database, files, and configurations

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
RETENTION_DAYS=${RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

# Create backup directory
create_backup_directory() {
    log_info "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"/{database,files,configs}
    log_success "Backup directory created: $BACKUP_DIR"
}

# Backup MongoDB database
backup_mongodb() {
    log_info "Backing up MongoDB database..."
    
    local backup_file="$BACKUP_DIR/database/mongodb_$TIMESTAMP.gz"
    
    # Check if MongoDB container is running
    if docker-compose ps mongodb | grep -q "Up"; then
        docker-compose exec -T mongodb mongodump --archive --gzip > "$backup_file"
        
        if [[ $? -eq 0 ]]; then
            log_success "MongoDB backup created: $backup_file"
            echo "$backup_file" >> "$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt"
        else
            log_error "MongoDB backup failed"
            return 1
        fi
    else
        log_warning "MongoDB container is not running, skipping database backup"
    fi
}

# Backup Redis data
backup_redis() {
    log_info "Backing up Redis data..."
    
    local backup_file="$BACKUP_DIR/database/redis_$TIMESTAMP.rdb"
    
    # Check if Redis container is running
    if docker-compose ps redis | grep -q "Up"; then
        # Create Redis backup
        docker-compose exec redis redis-cli BGSAVE
        
        # Wait for backup to complete
        sleep 5
        
        # Copy backup file
        docker cp $(docker-compose ps -q redis):/data/dump.rdb "$backup_file"
        
        if [[ $? -eq 0 ]]; then
            log_success "Redis backup created: $backup_file"
            echo "$backup_file" >> "$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt"
        else
            log_error "Redis backup failed"
            return 1
        fi
    else
        log_warning "Redis container is not running, skipping Redis backup"
    fi
}

# Backup uploaded files and assets
backup_files() {
    log_info "Backing up uploaded files and assets..."
    
    local files_backup="$BACKUP_DIR/files/files_$TIMESTAMP.tar.gz"
    
    # List of directories to backup
    local dirs_to_backup=(
        "$PROJECT_ROOT/uploads"
        "$PROJECT_ROOT/public/assets"
        "$PROJECT_ROOT/ssl"
        "$PROJECT_ROOT/logs"
    )
    
    local existing_dirs=()
    for dir in "${dirs_to_backup[@]}"; do
        if [[ -d "$dir" ]]; then
            existing_dirs+=("$dir")
        fi
    done
    
    if [[ ${#existing_dirs[@]} -gt 0 ]]; then
        tar -czf "$files_backup" "${existing_dirs[@]}" 2>/dev/null || true
        
        if [[ $? -eq 0 ]]; then
            log_success "Files backup created: $files_backup"
            echo "$files_backup" >> "$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt"
        else
            log_error "Files backup failed"
            return 1
        fi
    else
        log_warning "No file directories found to backup"
    fi
}

# Backup configuration files
backup_configs() {
    log_info "Backing up configuration files..."
    
    local config_backup="$BACKUP_DIR/configs/configs_$TIMESTAMP.tar.gz"
    
    # List of configuration files to backup
    local configs_to_backup=(
        "$PROJECT_ROOT/docker-compose.yml"
        "$PROJECT_ROOT/docker-compose.dev.yml"
        "$PROJECT_ROOT/.env.production"
        "$PROJECT_ROOT/.env.staging"
        "$PROJECT_ROOT/nginx.conf"
        "$PROJECT_ROOT/nginx-default.conf"
        "$PROJECT_ROOT/monitoring"
        "$PROJECT_ROOT/logging"
        "$PROJECT_ROOT/scripts"
    )
    
    local existing_configs=()
    for config in "${configs_to_backup[@]}"; do
        if [[ -e "$config" ]]; then
            existing_configs+=("$config")
        fi
    done
    
    if [[ ${#existing_configs[@]} -gt 0 ]]; then
        tar -czf "$config_backup" "${existing_configs[@]}" 2>/dev/null || true
        
        if [[ $? -eq 0 ]]; then
            log_success "Configuration backup created: $config_backup"
            echo "$config_backup" >> "$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt"
        else
            log_error "Configuration backup failed"
            return 1
        fi
    else
        log_warning "No configuration files found to backup"
    fi
}

# Create backup metadata
create_backup_metadata() {
    log_info "Creating backup metadata..."
    
    local metadata_file="$BACKUP_DIR/backup_metadata_$TIMESTAMP.json"
    
    cat > "$metadata_file" << EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$(date -Iseconds)",
    "hostname": "$(hostname)",
    "environment": "${ENVIRONMENT:-production}",
    "version": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "backup_type": "full",
    "retention_days": $RETENTION_DAYS,
    "files": [
$(if [[ -f "$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt" ]]; then
    while IFS= read -r file; do
        echo "        \"$file\","
    done < "$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt" | sed '$ s/,$//'
fi)
    ]
}
EOF
    
    log_success "Backup metadata created: $metadata_file"
}

# Verify backup integrity
verify_backup() {
    log_info "Verifying backup integrity..."
    
    local verification_failed=false
    
    # Verify MongoDB backup
    if [[ -f "$BACKUP_DIR/database/mongodb_$TIMESTAMP.gz" ]]; then
        if gzip -t "$BACKUP_DIR/database/mongodb_$TIMESTAMP.gz"; then
            log_success "MongoDB backup verification passed"
        else
            log_error "MongoDB backup verification failed"
            verification_failed=true
        fi
    fi
    
    # Verify Redis backup
    if [[ -f "$BACKUP_DIR/database/redis_$TIMESTAMP.rdb" ]]; then
        if file "$BACKUP_DIR/database/redis_$TIMESTAMP.rdb" | grep -q "Redis RDB"; then
            log_success "Redis backup verification passed"
        else
            log_error "Redis backup verification failed"
            verification_failed=true
        fi
    fi
    
    # Verify tar archives
    for archive in "$BACKUP_DIR"/files/files_$TIMESTAMP.tar.gz "$BACKUP_DIR"/configs/configs_$TIMESTAMP.tar.gz; do
        if [[ -f "$archive" ]]; then
            if tar -tzf "$archive" > /dev/null 2>&1; then
                log_success "Archive verification passed: $(basename "$archive")"
            else
                log_error "Archive verification failed: $(basename "$archive")"
                verification_failed=true
            fi
        fi
    done
    
    if [[ "$verification_failed" == true ]]; then
        log_error "Backup verification failed"
        return 1
    else
        log_success "All backup verifications passed"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -name "*.gz" -o -name "*.rdb" -o -name "*.json" -o -name "*.txt" | while read -r file; do
        rm -f "$file"
        ((deleted_count++))
        log_info "Deleted old backup: $(basename "$file")"
    done
    
    # Clean up empty directories
    find "$BACKUP_DIR" -type d -empty -delete 2>/dev/null || true
    
    log_success "Cleanup completed. Deleted $deleted_count old backup files"
}

# Upload backup to remote storage (optional)
upload_to_remote() {
    if [[ -n "$BACKUP_REMOTE_URL" ]]; then
        log_info "Uploading backup to remote storage..."
        
        # This is a placeholder for remote backup upload
        # You can implement S3, Google Cloud Storage, or other remote storage here
        
        # Example for S3:
        # aws s3 sync "$BACKUP_DIR" "$BACKUP_REMOTE_URL/$(date +%Y/%m/%d)/"
        
        log_info "Remote backup upload would be implemented here"
    fi
}

# Send backup notification
send_notification() {
    local status=$1
    local message=$2
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        local color="good"
        if [[ "$status" != "success" ]]; then
            color="danger"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"title\":\"Rural Connect AI Backup\",\"text\":\"$message\",\"footer\":\"$(hostname)\",\"ts\":$(date +%s)}]}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
    
    if [[ -n "$EMAIL_NOTIFICATION" ]]; then
        echo "$message" | mail -s "Rural Connect AI Backup - $status" "$EMAIL_NOTIFICATION" 2>/dev/null || true
    fi
}

# Main backup function
main() {
    log_info "Starting backup process for Rural Connect AI"
    log_info "Timestamp: $TIMESTAMP"
    log_info "Backup directory: $BACKUP_DIR"
    
    local backup_failed=false
    
    create_backup_directory
    
    # Perform backups
    backup_mongodb || backup_failed=true
    backup_redis || backup_failed=true
    backup_files || backup_failed=true
    backup_configs || backup_failed=true
    
    create_backup_metadata
    
    # Verify backups
    if ! verify_backup; then
        backup_failed=true
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Upload to remote storage
    upload_to_remote
    
    # Send notification
    if [[ "$backup_failed" == true ]]; then
        log_error "Backup process completed with errors"
        send_notification "error" "Backup process completed with errors. Please check the logs."
        exit 1
    else
        log_success "Backup process completed successfully!"
        send_notification "success" "Backup process completed successfully. Backup timestamp: $TIMESTAMP"
    fi
}

# Handle script interruption
trap 'log_error "Backup process interrupted"; exit 1' INT TERM

# Run main function
main "$@"