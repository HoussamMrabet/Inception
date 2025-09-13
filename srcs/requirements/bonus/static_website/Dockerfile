FROM debian:12

RUN apt-get update -y && apt-get upgrade -y

RUN apt-get install -y php

RUN mkdir -p www/html

COPY app/ /www/html/

ENTRYPOINT [ "php", "-S", "0.0.0.0:9999", "-t", "/www/html/" ]