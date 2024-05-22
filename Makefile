export PYTHONPATH := ${PYTHONPATH}:./create_llama/backend
export CREATE_LLAMA_VERSION=0.1.7
export NEXT_PUBLIC_API_URL=/api/chat

create-llama-app:
	@echo "\nCreating Llama App..."
	rm -rf create_llama
	npx -y create-llama@${CREATE_LLAMA_VERSION} \
		--framework fastapi \
		--template streaming \
		--engine context \
		--frontend \
		--ui shadcn \
		--observability none \
		--open-ai-key none \
		--tools none \
		--post-install-action none \
		--no-llama-parse \
		--no-files \
		--vector-db chroma \
		-- create_llama
	# We don't need the example data and default .env files
	rm -rf create_llama/backend/data/*
	rm -rf create_llama/backend/.env
	rm -rf create_llama/frontend/.env

patch-chat: create-llama-app
	cp -r ./patch/* ./create_llama/

build-chat: patch-chat
	@echo "\nBuilding Chat UI..."
	cd ./create_llama/frontend && npm install && npm run build
	@echo "\nCopying Chat UI to static folder..."
	mkdir -p ./static && cp -r ./create_llama/frontend/out/* ./static/
	@echo "\nDone!"

build-admin:
	@echo "\nBuilding Admin UI..."
	cd ./admin && npm install && npm run build
	@echo "\nCopying Admin UI to static folder..."
	mkdir -p ./static/admin && cp -r ./admin/out/* ./static/admin/
	@echo "\nDone!"

build-frontends: build-chat build-admin

run:
	poetry run python main.py

dev:
# Start the backend and frontend servers
# Kill both servers if a stop signal is received
	@export ENVIRONMENT=dev; \
	trap 'kill 0' SIGINT; \
	poetry run python main.py & \
	npm run dev --prefix ./admin & \
	wait
