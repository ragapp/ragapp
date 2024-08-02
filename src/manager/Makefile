.PHONY: build-frontend dev

build-frontend:
	@echo "\nBuilding Admin Dashbboard..."
	cd ./frontend && rm -rf out && pnpm install && pnpm run build
	@echo "\nCopying Admin Dashbboard to static folder..."
	rm -rf ./static && mkdir -p ./static && cp -r ./frontend/out/ ./static
	@echo "\nDone!"

dev:
# Start the backend and frontend servers
# Kill both servers if a stop signal is received
	@export ENVIRONMENT=dev; \
	trap 'kill 0' SIGINT; \
	poetry run fastapi run main.py --reload & \
	pnpm --prefix ./frontend run dev & \
	wait
