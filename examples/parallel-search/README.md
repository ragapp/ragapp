# Import web research into RAGapp

Collect current web search excerpts with [Parallel Search MCP](https://docs.parallel.ai/integrations/mcp/search-mcp), then upload them as a knowledge file in RAGapp. The example saves source titles, URLs, publication dates when available, and a retrieval timestamp alongside the excerpts so you can ask about the sources later.

The search runs separately from RAGapp. It uses the free anonymous MCP endpoint over Streamable HTTP, with Fast mode for search and no Parallel account or API key. Free access has usage limits. This creates a snapshot of search excerpts, not complete pages or live search during chat.

## Collect research

Use Python 3.10 or later. From the repository root:

```sh
python -m venv /tmp/ragapp-research-env
. /tmp/ragapp-research-env/bin/activate
python -m pip install -r examples/parallel-search/requirements.txt

python examples/parallel-search/search.py \
  "Find recent official guidance on deploying retrieval augmented generation applications" \
  --query "RAG deployment production guidance" \
  --query "retrieval augmented generation deployment security" \
  --output web-research.txt
```

On Windows, create the virtual environment in a local folder and activate it with `Scripts\activate` instead. The script loads no API keys or saved MCP client configuration. Only the objective and queries are sent; it does not read or upload your RAGapp files.

Choose a new `.txt` filename for each run. Existing files are never overwritten. `--timeout 60` sets the overall search deadline in seconds. Search errors, empty results and malformed responses exit unsuccessfully without creating a research file. If the service returns a usage-limit error, follow its retry guidance rather than repeatedly rerunning the command.

## Add it to your knowledge

1. [Start and configure RAGapp](../../README.md#get-started), including your model and embedding provider.
2. Review `web-research.txt` and its source URLs for relevance and accuracy. Web excerpts are untrusted source material; remove anything you do not want in your knowledge base.
3. Open http://localhost:8000/admin. In **Knowledge**, use the local file upload with **Use LlamaCloud** off. Upload `web-research.txt` and wait for indexing to finish. The default file loader supports `.txt`; LlamaParse is not needed.
4. In chat, ask a question such as: "Based on the uploaded web research, what deployment practices are recommended? Include the source URLs from the file."

Your configured model and embedding provider are still used by RAGapp for indexing and chat. The script does not change your agents, tools, providers or knowledge settings. To refresh the snapshot, collect a new file and replace the old one through RAGapp's Knowledge UI.

## Check the example

After installing the example requirements, run its transport and file-safety tests without a network connection:

```sh
python -m unittest discover -s examples/parallel-search -p 'test_*.py'
```
