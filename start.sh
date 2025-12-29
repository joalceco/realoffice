#!/bin/bash

# RealOffice Quick Start Script

echo "=================================="
echo "RealOffice Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker is installed"

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker Compose is available"
echo ""

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker compose down -v 2>/dev/null

echo ""
echo "🏗️  Building and starting services..."
echo "This may take a few minutes on first run..."
echo ""

# Build and start services
if docker compose up --build -d; then
    echo ""
    echo "=================================="
    echo "✅ RealOffice is starting!"
    echo "=================================="
    echo ""
    echo "Services:"
    echo "  - Frontend:  http://localhost:3000"
    echo "  - Backend:   http://localhost:8000"
    echo "  - API Docs:  http://localhost:8000/docs"
    echo ""
    echo "Waiting for services to be ready..."
    sleep 10
    
    echo ""
    echo "Service status:"
    docker compose ps
    
    echo ""
    echo "To view logs:"
    echo "  docker compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker compose down"
    echo ""
    echo "Happy coding! 🚀"
else
    echo ""
    echo "❌ Failed to start services"
    echo "Check the error messages above for details"
    exit 1
fi
