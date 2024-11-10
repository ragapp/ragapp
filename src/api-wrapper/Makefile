.PHONY: dev docker-build docker-run docker-stop

dev:
	@export ENVIRONMENT=dev; \
	npm i
	npm run develop
	wait

docker-build:
	docker build -t rag-api-wrapper .

docker-run:
	docker run -d \
		--name rag-api-wrapper \
		-p 1337:1337 \
		--env-file .env \
		rag-api-wrapper

docker-stop:
	docker stop rag-api-wrapper
	docker rm rag-api-wrapper

docker-logs:
	docker logs -f rag-api-wrapper

docker-shell:
	docker exec -it rag-api-wrapper sh
