#!/bin/bash
set -e

cd /var/www/html

# Only run setup if WordPress isn't fully configured
if [ ! -f .setup_complete ]; then
    echo "Starting WordPress setup..."

    # Always download WordPress (will overwrite if exists)
    echo "Downloading WordPress..."
    wp core download --allow-root --force

    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    sleep 20

    echo "Creating wp-config.php..."
    wp config create \
        --dbname="$MDB_NAME" \
        --dbuser="$MDB_USER" \
        --dbpass="$MDB_PASS" \
        --dbhost="$MDB_HOST" \
        --allow-root \
        --path=/var/www/html \
        --force

    # Check if WordPress is already installed
    if ! wp core is-installed --allow-root --path=/var/www/html 2>/dev/null; then
        echo "Installing WordPress core..."
        wp core install \
            --url="$DOMAIN_NAME" \
            --title="$WP_TITLE" \
            --admin_user="$WP_ADMIN_USER" \
            --admin_password="$WP_ADMIN_PASS" \
            --admin_email="$WP_ADMIN_EMAIL" \
            --skip-email \
            --allow-root \
            --path=/var/www/html
    else
        echo "WordPress core is already installed."
    fi

    # Check if additional user exists
    if ! wp user get "$WP_USER" --allow-root --path=/var/www/html >/dev/null 2>&1; then
        echo "Creating additional user: $WP_USER"
        wp user create "$WP_USER" "$WP_EMAIL" \
            --user_pass="$WP_PASS" \
            --role=author \
            --allow-root \
            --path=/var/www/html
    else
        echo "User $WP_USER already exists."
    fi

    echo "WordPress users created:"
    wp user list --allow-root --path=/var/www/html

    echo "WordPress setup completed successfully!"
    touch .setup_complete
else
    echo "WordPress is already set up. Starting PHP-FPM..."
fi

echo "Starting PHP-FPM..."
PHP_FPM=$(find /usr/sbin -name "php-fpm*" | head -1)
exec "$PHP_FPM" -F  