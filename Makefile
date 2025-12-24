# FeedS Docker Makefile
.PHONY: help build up down restart logs clean dev prod

# Default target
help: ## Show this help message
	@echo "FeedS Docker Management"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development commands
build: ## Build all services
	docker-compose build

up: ## Start all services in background
	docker-compose up -d

dev: ## Start development environment with hot reload
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs from all services
	docker-compose logs -f

logs-%: ## Show logs from specific service (e.g., make logs-backend)
	docker-compose logs -f $*

# Production commands
prod: ## Start production environment
	docker-compose -f docker-compose.prod.yml up -d

prod-build: ## Build and start production environment
	docker-compose -f docker-compose.prod.yml up -d --build

# Maintenance commands
clean: ## Remove all containers, volumes, and images
	docker-compose down -v --remove-orphans
	docker system prune -f

clean-all: ## Remove everything including images
	docker-compose down -v --remove-orphans
	docker system prune -a -f

# Database commands
db-shell: ## Access PostgreSQL shell
	docker-compose exec postgres psql -U feeds_user -d feeds_db

db-reset: ## Reset database (WARNING: destroys all data)
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 10
	docker-compose exec postgres psql -U feeds_user -d feeds_db -f /docker-entrypoint-initdb.d/01-init.sql
	docker-compose exec postgres psql -U feeds_user -d feeds_db -f /docker-entrypoint-initdb.d/02-seed.sql

# Backend commands
backend-shell: ## Access backend container shell
	docker-compose exec backend bash

backend-logs: ## Show backend logs
	docker-compose logs -f backend

# Frontend commands
frontend-shell: ## Access frontend container shell
	docker-compose exec frontend sh

frontend-logs: ## Show frontend logs
	docker-compose logs -f frontend

# Health checks
health: ## Check health of all services
	@echo "Checking backend health..."
	@curl -f http://localhost:8000/api/v1/metrics/health > /dev/null 2>&1 && echo "✅ Backend OK" || echo "❌ Backend FAIL"
	@echo "Checking database..."
	@docker-compose exec -T postgres pg_isready -U feeds_user -d feeds_db > /dev/null 2>&1 && echo "✅ Database OK" || echo "❌ Database FAIL"

# Utility commands
status: ## Show status of all services
	docker-compose ps

volumes: ## List all Docker volumes
	docker volume ls | grep feeds

networks: ## List all Docker networks
	docker network ls | grep feeds