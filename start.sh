#!/bin/bash

# TyreHero Emergency Service - Production Startup Script
# 
# This script handles production deployment with health checks,
# monitoring, and emergency service requirements

set -euo pipefail

# Configuration
PROJECT_NAME="tyrehero-emergency-service"
LOG_DIR="./logs"
PID_FILE="./tyrehero.pid"
PORT=${PORT:-3000}
NODE_ENV=${NODE_ENV:-production}
HEALTH_CHECK_URL="http://localhost:${PORT}/health"
MAX_STARTUP_TIME=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root (not recommended for production)
check_user() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root is not recommended for production"
        warning "Consider creating a dedicated user for the service"
    fi
}

# System requirements check
check_requirements() {
    log "Checking system requirements..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    REQUIRED_VERSION="14.0.0"
    
    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
        error "Node.js version $NODE_VERSION is below required version $REQUIRED_VERSION"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi
    
    # Check port availability
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null; then
        error "Port $PORT is already in use"
        exit 1
    fi
    
    success "System requirements check passed"
}

# Environment setup
setup_environment() {
    log "Setting up environment..."
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    
    # Check for .env file
    if [[ ! -f .env ]]; then
        if [[ -f .env.example ]]; then
            warning ".env file not found. Creating from .env.example"
            cp .env.example .env
            warning "Please configure .env file with your settings"
        else
            error ".env file not found and no .env.example available"
            exit 1
        fi
    fi
    
    # Load environment variables
    set -a
    source .env
    set +a
    
    success "Environment setup complete"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    if [[ ! -f package.json ]]; then
        error "package.json not found"
        exit 1
    fi
    
    # Install production dependencies
    npm ci --only=production --silent
    
    success "Dependencies installed"
}

# Security check
security_check() {
    log "Running security checks..."
    
    # Check for npm vulnerabilities
    if npm audit --audit-level=high --json > audit.json 2>/dev/null; then
        VULNERABILITIES=$(jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' audit.json 2>/dev/null || echo "0")
        if [[ "$VULNERABILITIES" -gt 0 ]]; then
            warning "Found $VULNERABILITIES high/critical vulnerabilities"
            warning "Run 'npm audit fix' to resolve"
        fi
    fi
    
    # Check file permissions
    if [[ -f server.js ]]; then
        PERMS=$(stat -c "%a" server.js)
        if [[ "$PERMS" != "644" && "$PERMS" != "755" ]]; then
            warning "server.js has unusual permissions: $PERMS"
        fi
    fi
    
    # Clean up
    rm -f audit.json
    
    success "Security check complete"
}

# Health check function
health_check() {
    local max_attempts=10
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 3
        ((attempt++))
    done
    
    return 1
}

# Start the server
start_server() {
    log "Starting TyreHero Emergency Service..."
    
    # Check if already running
    if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        error "Server is already running (PID: $(cat "$PID_FILE"))"
        exit 1
    fi
    
    # Start server based on environment
    if [[ "$NODE_ENV" == "production" ]]; then
        # Production mode with clustering
        log "Starting in production mode with clustering..."
        CLUSTER_MODE=true node server.js > "$LOG_DIR/startup.log" 2>&1 &
    else
        # Development mode
        log "Starting in development mode..."
        node server.js > "$LOG_DIR/startup.log" 2>&1 &
    fi
    
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"
    
    log "Server started with PID: $SERVER_PID"
    log "Performing health check..."
    
    # Wait for server to start and perform health check
    sleep 5
    
    if health_check; then
        success "TyreHero Emergency Service is running successfully!"
        success "Server URL: http://localhost:$PORT"
        success "Health check: $HEALTH_CHECK_URL"
        
        # Display service information
        echo ""
        echo "======================================"
        echo "🚨 EMERGENCY SERVICE ACTIVE 🚨"
        echo "======================================"
        echo "Emergency Phone: +447700900000"
        echo "Service Status: ONLINE"
        echo "Environment: $NODE_ENV"
        echo "Process ID: $SERVER_PID"
        echo "Log Location: $LOG_DIR"
        echo "======================================"
        
    else
        error "Health check failed - server may not be responding"
        
        # Show recent logs
        echo ""
        echo "Recent logs:"
        tail -20 "$LOG_DIR/startup.log" 2>/dev/null || echo "No logs available"
        
        # Clean up
        if kill -0 "$SERVER_PID" 2>/dev/null; then
            kill "$SERVER_PID"
        fi
        rm -f "$PID_FILE"
        
        exit 1
    fi
}

# Stop server function
stop_server() {
    log "Stopping TyreHero Emergency Service..."
    
    if [[ ! -f "$PID_FILE" ]]; then
        warning "PID file not found - server may not be running"
        return
    fi
    
    PID=$(cat "$PID_FILE")
    
    if kill -0 "$PID" 2>/dev/null; then
        # Graceful shutdown
        kill -TERM "$PID"
        
        # Wait for graceful shutdown
        local count=0
        while kill -0 "$PID" 2>/dev/null && [[ $count -lt 30 ]]; do
            sleep 1
            ((count++))
        done
        
        # Force kill if still running
        if kill -0 "$PID" 2>/dev/null; then
            warning "Graceful shutdown failed, forcing termination"
            kill -KILL "$PID"
        fi
        
        success "Server stopped"
    else
        warning "Server was not running"
    fi
    
    rm -f "$PID_FILE"
}

# Restart server
restart_server() {
    log "Restarting TyreHero Emergency Service..."
    stop_server
    sleep 2
    start_server
}

# Show server status
show_status() {
    if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        PID=$(cat "$PID_FILE")
        success "TyreHero Emergency Service is running (PID: $PID)"
        
        # Show health status
        if curl -sf "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            success "Health check: PASSED"
        else
            error "Health check: FAILED"
        fi
        
        # Show process info
        echo ""
        echo "Process Information:"
        ps -p "$PID" -o pid,ppid,user,%cpu,%mem,etime,cmd 2>/dev/null || echo "Process info unavailable"
        
    else
        warning "TyreHero Emergency Service is not running"
    fi
}

# Show logs
show_logs() {
    local lines=${1:-50}
    
    if [[ -f "$LOG_DIR/combined.log" ]]; then
        echo "=== Combined Logs (last $lines lines) ==="
        tail -n "$lines" "$LOG_DIR/combined.log"
    fi
    
    if [[ -f "$LOG_DIR/error.log" ]]; then
        echo ""
        echo "=== Error Logs (last $lines lines) ==="
        tail -n "$lines" "$LOG_DIR/error.log"
    fi
}

# Main function
main() {
    case "${1:-start}" in
        "start")
            check_user
            check_requirements
            setup_environment
            install_dependencies
            security_check
            start_server
            ;;
        "stop")
            stop_server
            ;;
        "restart")
            restart_server
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "${2:-50}"
            ;;
        "health")
            if curl -sf "$HEALTH_CHECK_URL"; then
                success "Service is healthy"
                exit 0
            else
                error "Service health check failed"
                exit 1
            fi
            ;;
        "install")
            check_requirements
            setup_environment
            install_dependencies
            success "Installation complete. Run './start.sh start' to launch the service."
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs|health|install}"
            echo ""
            echo "Commands:"
            echo "  start    - Start the TyreHero Emergency Service"
            echo "  stop     - Stop the service"
            echo "  restart  - Restart the service"
            echo "  status   - Show service status"
            echo "  logs     - Show recent logs"
            echo "  health   - Check service health"
            echo "  install  - Install dependencies and setup environment"
            echo ""
            echo "Emergency Contact: +447700900000"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"