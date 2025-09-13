FROM debian:12

RUN apt-get update -y && apt-get upgrade -y

RUN apt-get install -y redis-server

COPY config/redis.conf /etc/redis/redis.conf

EXPOSE 6379

ENTRYPOINT [ "redis-server", "--protected-mode", "no" ]