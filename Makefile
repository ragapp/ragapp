# Central Makefile at the root of the repository

.PHONY: ragapp manager

ragapp:
	$(MAKE) -C src/ragapp $(filter-out $@,$(MAKECMDGOALS))

manager:
	$(MAKE) -C src/manager $(filter-out $@,$(MAKECMDGOALS))

%:
	@:
