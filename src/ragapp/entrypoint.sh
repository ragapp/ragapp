#!/bin/bash

if [[ -n "$BASE_URL" ]]; then
    # Rewrite asset prefix to BASE_URL
    find static -type f -name "*.*" -exec sed -i 's|https://static-assets.ragapp.org|'$BASE_URL'|g' {} +

    # Add BASE_URL to logo and avatar
    # TODO: find a way that is independent of assets used
    find static -type f -name "*.*" -exec sed -i 's|"/logo.png|"'$BASE_URL'/logo.png|g' {} +
    find static -type f -name "*.*" -exec sed -i 's|"/llama.png|"'$BASE_URL'/llama.png|g' {} +

    # Replace static files of admin app
    find static/admin -type f -name "*.*" -exec sed -i 's|"/admin/_next/static|"'$BASE_URL'/admin/_next/static|g' {} +

    # Run sed command to generate window.ENV.API_URL to index.html
    # Add it at the start of the head tag
    sed -i '/<\/head>/i <script>window.ENV = {"BASE_URL":"'$BASE_URL'"};</script>' static/*.html static/**/*.html

    echo "Updated static files successfully!"
else
    # Remove asset prefix
    find static -type f -name "*.*" -exec sed -i 's|https://static-assets.ragapp.org||g' {} +
    echo "Updated static files successfully!"
fi

echo "Running application..."
exec "$@"