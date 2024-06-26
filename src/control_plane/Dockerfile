FROM python:3.11

WORKDIR /app

# Add create_llama/backend to PYTHONPATH
ENV PYTHONPATH=/app

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Copy current code to the container
COPY poetry.lock pyproject.toml ./
# Install dependencies
RUN poetry install --no-root --no-cache --only main

COPY . .

# Run the application
CMD ["python", "main.py"]