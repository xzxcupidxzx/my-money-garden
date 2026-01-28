#!/bin/bash
# =============================================
# Auto Backup Script for Finance App on NAS
# =============================================
# 
# This script creates daily database backups
# and automatically removes old backups.
#
# Setup cron job:
#   chmod +x backup.sh
#   crontab -e
#   0 2 * * * cd /path/to/finance-app && ./docs/self-host/backup.sh >> .data/backups/backup.log 2>&1
#
# =============================================

set -e

# Configuration
CONTAINER_NAME="finance-db"
BACKUP_DIR=".data/backups"
KEEP_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================="
echo "Finance App Database Backup"
echo "Date: $(date)"
echo "============================================="

# Create backup directory if not exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}Error: Container $CONTAINER_NAME is not running${NC}"
    exit 1
fi

# Create backup
echo "Creating backup: $BACKUP_FILE"
docker exec $CONTAINER_NAME pg_dump -U postgres postgres > "$BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}"

# Remove old backups
echo "Removing backups older than $KEEP_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)
echo "Deleted $DELETED old backup(s)"

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "No backups found"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo -e "${GREEN}Total backup folder size: $TOTAL_SIZE${NC}"
echo "============================================="
echo "Backup completed successfully!"
echo "============================================="
