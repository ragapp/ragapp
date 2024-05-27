import os
import json
from pydantic import BaseModel, Field


class CrawlUrl(BaseModel):
    base_url: str
    prefix: str
    max_depth: int = Field(default=1, ge=0)


class WebLoaderConfig(BaseModel):
    driver_arguments: list[str] = Field(default=None)
    urls: list[CrawlUrl]


def get_web_documents(user_id: str, config: WebLoaderConfig):
    from llama_index.readers.web import WholeSiteReader
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options

    options = Options()
    driver_arguments = config.driver_arguments or []
    for arg in driver_arguments:
        options.add_argument(arg)

    docs = []
    for url in config.urls:
        user_prefix = f"{url.prefix}/{user_id}"
        scraper = WholeSiteReader(
            prefix=user_prefix,
            max_depth=url.max_depth,
            driver=webdriver.Chrome(options=options),
        )
        docs.extend(scraper.load_data(url.base_url))

    return docs
