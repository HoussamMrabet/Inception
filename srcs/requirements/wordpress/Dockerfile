FROM debian

RUN apt-get update && apt-get install -y php8.1-fpm php8.1-mysql wget tar && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/www/html

WORKDIR /var/www/html

RUN wget https://wordpress.org/latest.tar.gz && tar -xvzf latest.tar.gz && rm latest.tar.gz && mv wordpress/* . && rmdir wordpress

COPY conf/www.conf /etc/php/8.1/fpm/pool.d/

EXPOSE 9000
CMD ["php-fpm8.1", "-F"]
