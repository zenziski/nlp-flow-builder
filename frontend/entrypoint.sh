#!/bin/sh
# Inject runtime env vars into a JS file loaded by the app before React boots.
cat > /usr/share/nginx/html/env.js << EOF
window.__ENV__ = {
  RUNTIME_URL: "${BACKEND_URL}/api/v1"
};
EOF
exec nginx -g "daemon off;"
