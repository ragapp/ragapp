export PYTHONPATH := ${PYTHONPATH}:./create_llama/backend

patch-chat:
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
