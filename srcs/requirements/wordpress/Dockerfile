FROM debian:12

RUN apt-get update && apt-get install -y \
    php-fpm php-mysql php-cli php-redis \
    mariadb-client curl wget less unzip \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/hmrabet/data/mariadb

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

RUN mkdir -p /var/www/html && chown -R www-data:www-data /var/www/html

RUN rm -f /etc/php/*/fpm/pool.d/www.conf
COPY conf/www.conf /etc/php/8.2/fpm/pool.d/www.conf

RUN mkdir -p /run/php && chown www-data:www-data /run/php

COPY tools/script.sh /script.sh
RUN chmod +x /script.sh

WORKDIR /var/www/html

EXPOSE 9000

ENTRYPOINT ["/script.sh"]
