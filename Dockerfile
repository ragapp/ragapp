# ======= FRONT-END BUILD ==========
FROM node:20-alpine as build

# Install make
RUN apk add --no-cache make

WORKDIR /app

COPY . .

RUN make build-frontend

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

# Copy static files from the front-end build 
COPY --from=build /app/create_llama/frontend/out /app/static

# Copy current code to the container
# and remove the frontend folder
COPY . .
RUN rm -rf create_llama/frontend

# Install dependencies
RUN poetry install --no-root --no-cache --only main

# Todo: Replace this step once the Admin UI is ready
# Prepare the example .env
RUN mv default.env .env

EXPOSE 8000

CMD ["python", "main.py"]