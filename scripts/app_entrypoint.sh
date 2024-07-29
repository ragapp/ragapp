#!/bin/bash
# This entrypoint used for multiple RAG apps deployment under reverse proxy

# Run sed command for all files in the static directory
sed -i 's|"/_next/static|"'$BASE_URL'/_next/static|g' static/*.*
sed -i 's|"/admin/_next/static|"'$BASE_URL'/admin/_next/static|g' static/admin/*.*
sed -i 's|"/api/|"'$BASE_URL'/api/|g' static/*.*

# Run sed command to generate window.ENV.API_URL to index.html
# Add it at the start of the head tag
sed -i '/<\/head>/i <script>window.ENV = {"BASE_URL":"'$BASE_URL'"};</script>' static/*.html static/**/*.html

echo "Updated static files succesfully!"
echo "Running application..."

exec "$@"