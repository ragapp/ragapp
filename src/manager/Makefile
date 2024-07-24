build-frontends:
	@echo "\nBuilding Admin Dashbboard..."
	cd ./frontend && pnpm install && pnpm run build
	@echo "\nCopying Admin Dashbboard to static folder..."
	rm -rf ./static && mkdir -p ./static && cp -r ./frontend/out/ ./static
	@echo "\nDone!"