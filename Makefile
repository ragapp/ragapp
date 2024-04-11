export PYTHONPATH := ${PYTHONPATH}:./create_llama/backend


build-frontend:
	@echo "\nBuilding frontend..."
	cd ./create_llama/frontend && npm install && npm run build
	@echo "\nCopying frontend build to static folder..."
	mkdir -p ./static && cp -r ./create_llama/frontend/out/* ./static/
	@echo "\nDone!"

generate:
	poetry run python create_llama/backend/app/engine/generate.py

run:
	poetry run python main.py
