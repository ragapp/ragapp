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

# Append tracking snippet to static/index.html if TRACKING_SNIPPET is set
# use awk to insert the snippet at the correct position and avoid escaping special characters
if [[ -n "$TRACKING_SNIPPET" ]]; then
    awk -v snippet="$TRACKING_SNIPPET" '
    /<\/head>/ {
        print snippet
    }
    { print }
    ' static/index.html > static/index.html.tmp && mv static/index.html.tmp static/index.html
    echo "Appended tracking snippet to static/index.html"
fi

# Copy default config to mounted volume if it is empty
if [[ -z "$(ls -A /app/config)" ]]; then
    cp -r /app/.config/. /app/config/
    echo "Config folder is empty, use default configuration!"
fi

if [[ "${S3,,}" == "true" ]]; then
    # Install s3fs package
    apt-get update && apt-get install -y s3fs

    # Ensure /app/s3 directory exists
    mkdir -p /app/s3

    # Mount the S3 bucket to /app/s3
    echo "$S3_ACCESS_KEY:$S3_SECRET_KEY" > /root/.passwd-s3fs
    chmod 600 /root/.passwd-s3fs
    s3fs $S3_BUCKET_NAME /app/s3 -o url=$S3_URL -o use_path_request_style -o passwd_file=/root/.passwd-s3fs -o allow_other

    echo "Mounted S3 bucket to /app/s3"
fi

echo "Running application..."

exec "$@"