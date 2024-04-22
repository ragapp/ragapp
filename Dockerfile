# ======= FRONT-END BUILD ==========
FROM node:20-alpine as build

# Install make
RUN apk add --no-cache make

WORKDIR /app

COPY Makefile .
COPY create_llama/frontend ./create_llama/frontend
COPY admin ./admin

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

# Copy static files from the build stage 
COPY --from=build /app/create_llama/frontend/out /app/static
COPY --from=build /app/admin/out /app/static/admin

# Copy current code to the container
# and remove the frontend folder
COPY poetry.lock pyproject.toml ./
# Install dependencies
RUN poetry install --no-root --no-cache --only main

COPY . .
RUN rm -rf create_llama/frontend

# Prepare the example .env
RUN mv default.env .env
# Create an empty data folder
RUN mkdir -p data

EXPOSE 8000

CMD ["python", "main.py"]