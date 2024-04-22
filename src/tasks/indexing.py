from create_llama.backend.app.engine.generate import generate_datasource


def index_all():
    # Just call the generate_datasource from create_llama for now
    # Todo: update this once we added ingestion pipeline in create_llama
    generate_datasource()
    return True
