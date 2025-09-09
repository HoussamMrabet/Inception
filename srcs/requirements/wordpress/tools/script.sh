#!/bin/bash
set -e

cd /var/www/html

wp core download --allow-root

sleep 10

wp config create \
    --dbname="$MDB_NAME" \
    --dbuser="$MDB_USER" \
    --dbpass="$MDB_PASS" \
    --dbhost="$MDB_HOST" \
    --allow-root \
    --path=/var/www/html

wp core install \
    --url="$DOMAIN_NAME" \
    --title="$WP_TITLE" \
    --admin_user="$WP_ADMIN_USER" \
    --admin_password="$WP_ADMIN_PASS" \
    --admin_email="$WP_EMAIL" \
    --skip-email \
    --allow-root \
    --path=/var/www/html

wp user create "$WP_USER" "$WP_EMAIL" \
    --user_pass="$WP_PASS" \
    --role=author \
    --allow-root \
    --path=/var/www/html \

PHP_FPM=$(find /usr/sbin -name "php-fpm*" | head -1)

exec "$PHP_FPM" -F