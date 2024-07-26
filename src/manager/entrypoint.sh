#!/bin/bash

# Run sed command for all files in the static directory
sed -i 's|/_next/static|'$APP_PATH'/_next/static|g' static/*.*

# Run sed command to generate window.ENV.API_URL to index.html
# Add it at the start of the head tag
sed -i '/<\/head>/i <script>window.ENV = {"NEXT_PUBLIC_API_URL":"'$APP_PATH'"};</script>' static/index.html

echo "Updated static files succesfully!"
echo "Running application..."

exec "$@"