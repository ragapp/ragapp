#!/bin/bash

if [[ -n "$BASE_URL" ]]; then
    # Run sed command for all files in the static directory
    # Replace this: url(/_next with this: url($BASE_URL/_next (Mostly for link in CSS files)
    find static -type f -name "*.*" -exec sed -i 's|url(/_next|url('"$BASE_URL"'/_next|g' {} +
    # Replace this: "static/ with this: "$BASE_URL/static/
    # TODO: This is not working for some reason
    find static -type f -name "*.*" -exec sed -i 's|"static/|"'$BASE_URL'/static/|g' {} +

    # Logo and avatar
    find static -type f -name "*.*" -exec sed -i 's|"/logo.png|"'$BASE_URL'/logo.png|g' {} +
    find static -type f -name "*.*" -exec sed -i 's|"/llama.png|"'$BASE_URL'/llama.png|g' {} +

    find static -type f -name "*.*" -exec sed -i 's|"/_next/static|"'$BASE_URL'/_next/static|g' {} +
    find static/admin -type f -name "*.*" -exec sed -i 's|"/admin/_next/static|"'$BASE_URL'/admin/_next/static|g' {} +

    # Run sed command to generate window.ENV.API_URL to index.html
    # Add it at the start of the head tag
    sed -i '/<\/head>/i <script>window.ENV = {"BASE_URL":"'$BASE_URL'"};</script>' static/*.html static/**/*.html

    echo "Updated static files successfully!"
fi

echo "Running application..."

exec "$@"