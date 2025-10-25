#!/bin/sh

# Docker entrypoint script
# This script injects runtime environment variables into the config.js file

set -e

echo "Starting AI Travel Planner..."

# Check if Supabase configuration is provided
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "WARNING: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are not set."
  echo "The application may not function properly without these credentials."
  echo "Please set them using: docker run -e SUPABASE_URL=... -e SUPABASE_ANON_KEY=..."
fi

# Replace placeholders in config.js with actual environment variables
CONFIG_FILE="/usr/share/nginx/html/config.js"

if [ -f "$CONFIG_FILE" ]; then
  echo "Injecting runtime configuration..."
  
  # Escape special characters in the values
  SUPABASE_URL_ESCAPED=$(echo "$SUPABASE_URL" | sed 's/[\/&]/\\&/g')
  SUPABASE_ANON_KEY_ESCAPED=$(echo "$SUPABASE_ANON_KEY" | sed 's/[\/&]/\\&/g')
  
  # Replace placeholders with actual values
  sed -i "s|__SUPABASE_URL__|${SUPABASE_URL_ESCAPED}|g" "$CONFIG_FILE"
  sed -i "s|__SUPABASE_ANON_KEY__|${SUPABASE_ANON_KEY_ESCAPED}|g" "$CONFIG_FILE"
  
  echo "Configuration injected successfully!"
else
  echo "WARNING: config.js not found at $CONFIG_FILE"
fi

# Start nginx
echo "Starting Nginx..."
exec nginx -g 'daemon off;'
