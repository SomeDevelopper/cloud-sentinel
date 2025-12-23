#!/bin/bash

# Cloud Sentinel Startup Script
# This script helps you start the Cloud Sentinel application

set -e

echo "🛡️  Cloud Sentinel Startup"
echo "========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f "./backend/.env" ]; then
    echo "⚠️  Backend .env file not found."
    echo "   Creating from example..."
    if [ -f "./backend/.env.example" ]; then
        cp ./backend/.env.example ./backend/.env
        echo "✅ Created backend/.env from example"
        echo "   Please edit backend/.env and add your configuration"
        echo ""
    else
        echo "❌ backend/.env.example not found"
        exit 1
    fi
fi

# Show menu
echo "Select startup mode:"
echo ""
echo "1) Start All Services (with hot reload)"
echo "2) Backend Only (for local frontend development)"
echo "3) Stop All Services"
echo "4) Stop and Reset (removes volumes)"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting All Services..."
        echo ""
        docker-compose up --build
        ;;
    2)
        echo ""
        echo "⚙️  Starting Backend Services Only..."
        echo ""
        echo "Frontend will be available for local development on http://localhost:3000"
        echo "Run 'cd frontend && npm run dev' in another terminal"
        echo ""
        docker-compose up postgres redis backend worker --build
        ;;
    3)
        echo ""
        echo "🛑 Stopping All Services..."
        echo ""
        docker-compose down
        echo "✅ All services stopped"
        ;;
    4)
        echo ""
        echo "⚠️  WARNING: This will delete all data including the database!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo "🗑️  Stopping and Removing All Containers and Volumes..."
            echo ""
            docker-compose down -v
            echo "✅ All services stopped and data removed"
        else
            echo "Cancelled."
        fi
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "========================="

if [ $choice -eq 1 ]; then
    echo ""
    echo "✅ Services are starting!"
    echo ""
    echo "Access your application:"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:8000"
    echo "  API Docs:  http://localhost:8000/docs"
    echo ""
    echo "Press Ctrl+C to stop all services"
fi
