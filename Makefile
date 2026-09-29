.PHONY: help install build up down test lint seed

help:
	@echo "VASPTrace Development Commands"
	@echo "-------------------------------"
	@echo "make install    : Install backend and frontend dependencies"
	@echo "make build      : Build docker containers"
	@echo "make up         : Start all services via docker-compose"
	@echo "make down       : Stop docker services"
	@echo "make test       : Run backend tests"
	@echo "make seed       : Seed database with demo investigations and VASP entities"
	@echo "make api-dev    : Start FastAPI backend in development mode"
	@echo "make web-dev    : Start Next.js frontend in development mode"

install:
	cd apps/api && pip install -r requirements.txt
	cd apps/web && npm install

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

seed:
	cd apps/api && python -m app.seed

test:
	cd apps/api && pytest -v tests/

api-dev:
	cd apps/api && uvicorn app.main:app --reload --port 8000

web-dev:
	cd apps/web && npm run dev
