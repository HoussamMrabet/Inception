#!/bin/bash

mkdir -p /etc/nginx/ssl

chmod 777 /etc/nginx/ssl

chown -R nobody:nogroup /etc/nginx/ssl

openssl req -x509 -nodes -out /etc/nginx/ssl/nginx.crt -keyout /etc/nginx/ssl/nginx.key -subj "/C=MO/ST=KH/L=KH/O=42/OU=42/CN=${DOMAIN_NAME}/UID=${USER}"

exec nginx -g 'daemon off;'