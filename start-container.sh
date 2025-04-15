#!/bin/sh

REACT_APP_MINIAPP_GTELPAY=${REACT_APP_MINIAPP_GTELPAY:-0}

cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  REACT_APP_MINIAPP_GTELPAY: "$REACT_APP_MINIAPP_GTELPAY"
};
EOF

## Run nginx
nginx -g "daemon off;"
