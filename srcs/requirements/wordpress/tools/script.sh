#!/bin/bash
set -e

cd /var/www/html

if [ ! -f .setup_complete ]; then

    wp core download --allow-root --force

    sleep 20

    wp config create \
        --dbname="$MDB_NAME" \
        --dbuser="$MDB_USER" \
        --dbpass="$MDB_PASS" \
        --dbhost="$MDB_HOST" \
        --allow-root \
        --path=/var/www/html \
        --force

    if ! wp core is-installed --allow-root --path=/var/www/html 2>/dev/null; then
        wp core install \
            --url="$DOMAIN_NAME" \
            --title="$WP_TITLE" \
            --admin_user="$WP_ADMIN_USER" \
            --admin_password="$WP_ADMIN_PASS" \
            --admin_email="$WP_ADMIN_EMAIL" \
            --skip-email \
            --allow-root \
            --path=/var/www/html
    fi

    if ! wp user get "$WP_USER" --allow-root --path=/var/www/html >/dev/null 2>&1; then
        wp user create "$WP_USER" "$WP_EMAIL" \
            --user_pass="$WP_PASS" \
            --role=author \
            --allow-root \
            --path=/var/www/html
    fi

    wp user list --allow-root --path=/var/www/html

    touch .setup_complete
fi

PHP_FPM=$(find /usr/sbin -name "php-fpm*" | head -1)
exec "$PHP_FPM" -F 