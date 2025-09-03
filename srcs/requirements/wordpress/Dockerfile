FROM debian:buster

RUN apt-get update && apt-get install -y \
    php-fpm php-mysql wget tar && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/www/html
WORKDIR /var/www/html

RUN wget https://wordpress.org/latest.tar.gz && \
    tar -xvzf latest.tar.gz && \
    rm latest.tar.gz && \
    mv wordpress/* . && \
    rmdir wordpress

COPY conf/www.conf /etc/php/7.3/fpm/pool.d/

EXPOSE 9000
CMD ["php-fpm7.3", "-F"]

