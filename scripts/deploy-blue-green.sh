#!/bin/bash

# Blue-Green Deployment Script for Firebase Hosting
# Usage: ./scripts/deploy-blue-green.sh [blue|green|promote]

set -e

# Configuration
PROJECT_ID="kisan-ai-18179"
PREVIEW_CHANNEL="green-preview"
PRODUCTION_CHANNEL="live"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        error "Firebase CLI is not installed. Please install it with: npm install -g firebase-tools"
    fi
}

# Build the application
build_app() {
    log "Building the application..."
    npm run build
    
    if [ $? -ne 0 ]; then
        error "Build failed"
    fi
    
    log "Build completed successfully"
}

# Deploy to Blue (Production)
deploy_blue() {
    log "Deploying to Blue (Production) environment..."
    
    # Set environment variables for deployment
    export DEPLOYMENT_ENVIRONMENT="blue"
    export DEPLOYMENT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Deploy to production
    firebase hosting:channel:deploy $PRODUCTION_CHANNEL \
        --project $PROJECT_ID \
        --only hosting \
        --message "Blue deployment: $DEPLOYMENT_TIMESTAMP"
    
    if [ $? -eq 0 ]; then
        log "✅ Blue deployment completed successfully"
        info "Production URL: https://$PROJECT_ID.web.app"
    else
        error "Blue deployment failed"
    fi
}

# Deploy to Green (Preview Channel)
deploy_green() {
    log "Deploying to Green (Preview) environment..."
    
    # Set environment variables for deployment
    export DEPLOYMENT_ENVIRONMENT="green"
    export DEPLOYMENT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Deploy to preview channel
    firebase hosting:channel:deploy $PREVIEW_CHANNEL \
        --project $PROJECT_ID \
        --only hosting \
        --message "Green deployment: $DEPLOYMENT_TIMESTAMP"
    
    if [ $? -eq 0 ]; then
        log "✅ Green deployment completed successfully"
        info "Preview URL: https://$PROJECT_ID--$PREVIEW_CHANNEL.web.app"
        info "Or use: firebase hosting:channel:open $PREVIEW_CHANNEL"
    else
        error "Green deployment failed"
    fi
}

# Promote Green to Blue (Production)
promote_green_to_blue() {
    log "Promoting Green environment to Blue (Production)..."
    
    warning "This will replace the current production deployment!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Promote preview channel to production
        firebase hosting:channel:promote $PREVIEW_CHANNEL \
            --project $PROJECT_ID \
            --message "Promote green to production: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        
        if [ $? -eq 0 ]; then
            log "✅ Promotion completed successfully"
            info "Green environment is now live in production"
        else
            error "Promotion failed"
        fi
    else
        warning "Promotion cancelled"
    fi
}

# List active channels
list_channels() {
    log "Listing active deployment channels..."
    firebase hosting:channels:list --project $PROJECT_ID
}

# Delete preview channel
delete_green() {
    log "Deleting Green (Preview) environment..."
    
    warning "This will remove the preview channel and its deployment"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        firebase hosting:channel:delete $PREVIEW_CHANNEL \
            --project $PROJECT_ID
        
        if [ $? -eq 0 ]; then
            log "✅ Preview channel deleted successfully"
        else
            error "Failed to delete preview channel"
        fi
    else
        warning "Deletion cancelled"
    fi
}

# Open preview channel in browser
open_preview() {
    log "Opening Green environment in browser..."
    firebase hosting:channel:open $PREVIEW_CHANNEL --project $PROJECT_ID
}

# Measure deployment time
measure_deployment() {
    local deployment_type=$1
    local start_time=$(date +%s.%N)
    
    log "⏱️ Starting deployment timing measurement for $deployment_type..."
    
    case $deployment_type in
        "blue")
            deploy_blue
            ;;
        "green")
            deploy_green
            ;;
        *)
            error "Invalid deployment type for measurement: $deployment_type"
            ;;
    esac
    
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)
    
    log "📊 Deployment time for $deployment_type: ${duration} seconds"
    
    # Save measurement to file
    echo "$(date),${deployment_type},${duration}" >> deployment-metrics.csv
    info "Metrics saved to deployment-metrics.csv"
}

# Show help
show_help() {
    echo "Blue-Green Deployment Script for Firebase Hosting"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  blue      Deploy to Blue (Production) environment"
    echo "  green     Deploy to Green (Preview) environment"
    echo "  promote   Promote Green to Blue (Production)"
    echo "  list      List active deployment channels"
    echo "  delete    Delete Green (Preview) environment"
    echo "  open      Open Green environment in browser"
    echo "  measure   Measure deployment time (specify blue|green)"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 blue                    # Deploy to production"
    echo "  $0 green                   # Deploy to preview"
    echo "  $0 promote                 # Promote preview to production"
    echo "  $0 measure green           # Measure green deployment time"
}

# Main script logic
main() {
    check_firebase_cli
    
    case "${1:-help}" in
        "blue")
            build_app
            deploy_blue
            ;;
        "green")
            build_app
            deploy_green
            ;;
        "promote")
            promote_green_to_blue
            ;;
        "list")
            list_channels
            ;;
        "delete")
            delete_green
            ;;
        "open")
            open_preview
            ;;
        "measure")
            if [ -z "$2" ]; then
                error "Please specify deployment type: blue or green"
            fi
            build_app
            measure_deployment $2
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
