.PHONY: create-llama-app patch-chat build-chat build-admin build-frontends run dev

export PYTHONPATH := ${PYTHONPATH}:./create_llama/backend
export CREATE_LLAMA_VERSION=0.3.7
export NEXT_PUBLIC_API_URL=/api/chat

create-llama-app:
	@echo "\nCreating Llama App..."
	rm -rf create_llama
	# Note: Include `--tools artifact` to include sandbox api code
	npx -y create-llama@${CREATE_LLAMA_VERSION} \
		create_llama \
		--pro \
	    --use-pnpm \
		--framework fastapi \
		--template streaming \
		--frontend \
		--ui shadcn \
		--observability none \
		--open-ai-key none \
		--tools none \
		--post-install-action none \
		--no-files \
		--tools artifact \
		--vector-db chroma
	# We don't need the example data and default .env files
	rm -rf create_llama/backend/data/*
	rm -rf create_llama/backend/.env
	rm -rf create_llama/frontend/.env

patch-chat: create-llama-app
	cp -r ./patch/* ./create_llama/

build-chat: patch-chat
	@echo "\nBuilding Chat UI..."
	cd ./create_llama/frontend && pnpm install && pnpm run build
	@echo "\nCopying Chat UI to static folder..."
	mkdir -p ./static && cp -r ./create_llama/frontend/out/* ./static/
	@echo "\nDone!"

build-admin:
	@echo "\nBuilding Admin UI..."
	cd ./admin-ui && pnpm install && pnpm run build
	@echo "\nCopying Admin UI to static folder..."
	mkdir -p ./static/admin && cp -r ./admin-ui/out/* ./static/admin/
	@echo "\nDone!"

build-frontends: build-chat build-admin

install:
	poetry install

run:
	poetry run python main.py

dev:
# Start the backend and frontend servers
# Kill both servers if a stop signal is received
	@export ENVIRONMENT=dev; \
	trap 'kill 0' SIGINT; \
	poetry run python main.py & \
	pnpm --prefix ./admin-ui run dev & \
	wait
