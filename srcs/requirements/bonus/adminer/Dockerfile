FROM debian:12

RUN apt-get update -y && apt-get upgrade -y

RUN apt-get install -y wget php php-mysqli

RUN mkdir html

RUN wget https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1.php -O /html/index.php

EXPOSE 8080

ENTRYPOINT [ "php", "-S", "0.0.0.0:8080", "-t", "/html" ]