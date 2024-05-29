#!/usr/bin/env bash

echo; echo
echo "reverse-proxy: Starting up!"
echo "  - HTTPS: ${HTTPS}"
echo "  - FRONTEND_DOMAIN_NAME: ${FRONTEND_DOMAIN_NAME}"
echo "  - BACKEND_DOMAIN_NAME: ${BACKEND_DOMAIN_NAME}"

set -e

# Directory used by certbot to serve certificate requests challenges:
mkdir -p /var/www/certbot

if [ "$HTTPS" = "true" ]; then
  echo "Starting in SSL mode"

  if [ -f /etc/nginx/conf.d/default.conf ]; then
    rm /etc/nginx/conf.d/default.conf
  fi

  echo
  echo "Obtaining SSL certificate for frontend domain name: ${FRONTEND_DOMAIN_NAME}"
  certbot certonly --noninteractive --agree-tos --register-unsafely-without-email --nginx -d ${FRONTEND_DOMAIN_NAME}

  echo
  echo "Obtaining SSL certificate for backend domain name: ${BACKEND_DOMAIN_NAME}"
  certbot certonly --noninteractive --agree-tos --register-unsafely-without-email --nginx -d ${BACKEND_DOMAIN_NAME}

  # Stop Nginx started by Certbot
  service nginx stop

  envsubst '$FRONTEND_DOMAIN_NAME $BACKEND_DOMAIN_NAME $DOMAIN_VALIDATION_KEY' < /nginx-ssl.conf > /etc/nginx/conf.d/default.conf
else
  echo "Starting in http mode"
  envsubst '$FRONTEND_DOMAIN_NAME $BACKEND_DOMAIN_NAME $DOMAIN_VALIDATION_KEY' < /nginx.conf > /etc/nginx/conf.d/default.conf
fi

# Start Nginx in foreground
nginx -g "daemon off;"
