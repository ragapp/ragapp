#!/bin/bash

if [[ -n "$BASE_URL" ]]; then
    # Run sed command for all files in the static directory
    sed -i 's|"/_next/static|"'$BASE_URL'/_next/static|g' static/*.*

    # Run sed command to generate window.ENV.BASE_URL to index.html
    # Add it at the start of the head tag
    sed -i '/<\/head>/i <script>window.ENV = {"BASE_URL":"'$BASE_URL'"};</script>' static/index.html

    echo "Updated static files successfully!"
    echo "Running application..."
fi

exec "$@"