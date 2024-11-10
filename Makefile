# Central Makefile at the root of the repository

.PHONY: ragapp manager wrapper

ragapp:
	$(MAKE) -C src/ragapp $(filter-out $@,$(MAKECMDGOALS))

manager:
	$(MAKE) -C src/manager $(filter-out $@,$(MAKECMDGOALS))

wrapper:
	$(MAKE) -C src/api-wrapper $(filter-out $@,$(MAKECMDGOALS))
%:
	@:
