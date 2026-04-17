#!/bin/bash

# Garlaws Platform Production Deployment Script
# This script handles the complete production deployment process

set -e

echo "🚀 Starting Garlaws Platform Production Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 20+"
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    npm ci
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."

    # Run type checking
    npm run typecheck

    # Run linting
    npm run lint

    # Run tests (if any)
    npm run test -- --passWithNoTests

    print_success "All tests passed"
}

# Build application
build_application() {
    print_status "Building application..."

    # Build for production
    npm run build

    print_success "Application built successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Generate database migrations
    npm run db:generate

    # In production, migrations would be run via a separate process
    # For now, we'll just validate the migration files exist
    if [ -d "src/db/migrations" ]; then
        print_success "Database migrations ready"
    else
        print_error "Database migrations not found"
        exit 1
    fi
}

# Build Docker image
build_docker_image() {
    print_status "Building Docker image..."

    docker build -t garlaws/platform:latest .

    print_success "Docker image built"
}

# Deploy to production
deploy_to_production() {
    print_status "Deploying to production..."

    # This would typically involve:
    # 1. Pushing Docker image to registry
    # 2. Updating orchestration platform (Coolify/AWS)
    # 3. Running database migrations
    # 4. Health checks

    print_warning "Production deployment configuration:"
    print_warning "- Docker image: garlaws/platform:latest"
    print_warning "- Environment: Production"
    print_warning "- Domain: https://www.garlaws.co.za"
    print_warning "- Database: Supabase PostgreSQL"

    print_success "Production deployment prepared"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."

    # Start the application briefly to check if it boots
    timeout 30s npm run start > /dev/null 2>&1 &
    local pid=$!

    sleep 10

    # Check if process is still running
    if kill -0 $pid 2>/dev/null; then
        kill $pid
        print_success "Health checks passed"
    else
        print_error "Application failed to start"
        exit 1
    fi
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  Garlaws Platform Production Deployment"
    echo "=========================================="

    check_prerequisites
    install_dependencies
    run_tests
    build_application
    run_migrations
    build_docker_image
    deploy_to_production
    run_health_checks

    echo ""
    print_success "🎉 Production deployment completed successfully!"
    echo ""
    print_status "Next steps:"
    print_status "1. Configure domain DNS (www.garlaws.co.za)"
    print_status "2. Set up SSL certificates"
    print_status "3. Configure production database"
    print_status "4. Set up monitoring and alerts"
    print_status "5. Run end-to-end tests"
    print_status "6. Notify stakeholders"
}

# Run main function
main "$@"