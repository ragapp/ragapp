# ======= FRONT-END BUILD ==========
FROM node:20-alpine AS build

# Install pnpm
RUN npm install -g pnpm@9.4.0

# Install make
RUN apk add --no-cache make

WORKDIR /app

COPY Makefile .
COPY admin-ui ./admin-ui
COPY patch/frontend ./patch/frontend

# Build static files for the Chat UI
RUN make build-frontends

# ======= RELEASE ==========
FROM python:3.11

WORKDIR /app

# Add create_llama/backend to PYTHONPATH
ENV PYTHONPATH=/app:/app/create_llama/backend

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Copy current code to the container
# and remove the frontend folder
COPY poetry.lock pyproject.toml ./
# Install dependencies
RUN poetry install --no-root --no-cache --only main

# Copy static files from the build stage 
COPY --from=build /app/create_llama/frontend/out /app/static
COPY --from=build /app/admin-ui/out /app/static/admin
COPY --from=build /app/create_llama/backend /app/create_llama/backend
COPY . .

# Create an empty data folder
RUN mkdir -p data

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["python", "main.py"]