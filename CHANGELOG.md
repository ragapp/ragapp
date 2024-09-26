# ragbox

## 0.1.3

### Patch Changes

- df326d7: Fix name of agent as tool include special characters
- 5b917e6: Use output from agent directly
- e4d7a91: Bump llama_index to version 0.11.11

## 0.1.2

### Patch Changes

- 9785b77: Add latest groq models and use original model name
- 6e084a9: Support for adding a tracking script to the chat UI
- 56858cc: Don't trigger indexing for each file (if multiple files are uploaded)
- 947f865: Fix cannot use query engine
- ea2af1b: Fix missing config in single deployment

## 0.1.1

### Patch Changes

- 982e22a: Use system prompt template with role, backstory and goal
- 8c9fac2: Fix image generator does not work with multi-agent

## 0.1.0

### Minor Changes

- 8e73b74: Add support for multi-agents

### Patch Changes

- b96763e: Fix issues using LlamaCloud

## 0.0.24

### Patch Changes

- 6cc4d2d: Add citations and next questions configs

## 0.0.23

### Patch Changes

- 9f3c8a9: Add support for domain and https deployment

## 0.0.22

### Patch Changes

- fb7e94f: Use volume for app persistence
- e12d8b5: Fix data source is not shown

## 0.0.21

### Patch Changes

- 7355971: Fixed broken file upload with LlamaParse
- 870c038: Add RAGapp user and admin authentication (using Keycloak)
- 0886008: Add UI configuration for API version used by Azure
- 410bd09: Add rate limiting (number of chat messages per user) to chat API
- cf584e5: Add possibility to select custom Ollama embedding models

## 0.0.20

### Patch Changes

- e91ff64: remove striped path for default rag_app label template

## 0.0.19

### Patch Changes

- 98ef118: Add manager app
- fd340ad: Add support for gpt-4o-mini model

## 0.0.18

### Patch Changes

- 8910838: Add Cohere reranker for improved retrieval results

## 0.0.17

### Patch Changes

- ec84dd6: Add Groq provider

## 0.0.16

### Patch Changes

- ade3163: Add Mistral AI provider

## 0.0.15

### Patch Changes

- b7b1f7f: Bump llama-index version to 0.10.53

## 0.0.14

### Patch Changes

- 6c7f7aa: Add support for LlamaCloud

## 0.0.13

### Patch Changes

- c7cbb6e: Bump create-llama version to 0.1.17
- c7cbb6e: Add support for T-Systems provider

## 0.0.12

### Patch Changes

- d901b4e: Add embedding model and base api config for OpenAI provider
- debfe4e: Add loading state to forms
- 0342480: Add custom tool prompt to system prompt

## 0.0.11

### Patch Changes

- 1ceec37: Bump create-llama version to 0.1.13
- 1ceec37: Add image generator tool

## 0.0.10

### Patch Changes

- 4cfe656: Add OpenAPI tool config
- 969374e: Add e2b code interpreter
- 4cfe656: Bump create-llama version to 0.1.11
- 4f178a6: Auto-submit forms on focus lost, clarified start up and improved UX for uploading files.

## 0.0.9

### Patch Changes

- fef1d1a: Fix not showing file viewer
- 67c3ac5: Fix the issue with losing chat config when switching providers
- 9dd1704: Add a new config for Llama parse
- 8803c69: Fix system prompt not working and improved Azure OpenAI validation
- f7dc582: Bump create-llama version to 0.1.10
- fef1d1a: Add timeout config for Ollama requests
- e559534: Add config for conversation starter questions

## 0.0.8

### Patch Changes

- 50537ff: Add support for Azure OpenAI provider

## 0.0.7

### Patch Changes

- 856c486: Fix fetching Ollama models from local Ollama

## 0.0.6

### Patch Changes

- f643ee2: Add support for Ollama provider

## 0.0.5

### Patch Changes

- 56e75d7: Add support for agent and tools (duckduckgo & wikipedia)

## 0.0.4

### Patch Changes

- 275a96b: Add support for multiple model providers (starting with Gemini)

## 0.0.3

### Patch Changes

- 2d00a14: Use ChromaDB vector storage (file based)
- 2d00a14: Bump create-llama to 0.1.4

## 0.0.2

### Patch Changes

- 548aab3: Change the default system prompt
- f1f9b8c: Show chat UI once RAG is configured

## 0.0.1

### Patch Changes

- 0ba8c06: Initial release
