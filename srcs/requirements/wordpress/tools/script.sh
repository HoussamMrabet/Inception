#!/bin/bash
set -e

sleep 10

echo "Starting WordPress setup..."

cd /var/www/html

# Check if WordPress files exist but aren't configured
if [ ! -f wp-config.php ]; then
    echo "WordPress configuration not found, setting up..."
    
    # Download WordPress if not present
    if [ ! -f wp-settings.php ]; then
        echo "Downloading WordPress..."
        wp core download --allow-root
    fi

    # Wait for database to be ready
    echo "Waiting for database..."
    sleep 10
    
    echo "Creating wp-config.php..."
    wp config create \
        --dbname="$DATA_BASE_NAME" \
        --dbuser="$DATA_BASE_USER" \
        --dbpass="$DATA_BASE_PASS" \
        --dbhost="mariadb" \
        --allow-root \
        --path=/var/www/html

    echo "Installing WordPress..."
    wp core install \
        --url="$DOMAIN_NAME" \
        --title="inception" \
        --admin_user="hmrabet" \
        --admin_password="hmrabet123" \
        --admin_email="hmrabet@example.com" \
        --skip-email \
        --allow-root \
        --path=/var/www/html

    echo "Creating additional user..."
    wp user create "testuser" "testuser@example.com" \
        --user_pass="testuser123" \
        --role=author \
        --allow-root \
        --path=/var/www/html \
        || echo "User may already exist"

    echo "WordPress setup completed."
else
    echo "WordPress is already configured."
fi

echo "Starting PHP-FPM..."
# Find the correct PHP-FPM binary
PHP_FPM=$(find /usr/sbin -name "php-fpm*" | head -1)
if [ -n "$PHP_FPM" ]; then
    exec "$PHP_FPM" -F
else
    echo "Error: php-fpm not found"
    exit 1
fi
