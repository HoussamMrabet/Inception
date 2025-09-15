FROM debian:12

RUN    apt-get update && apt-get install -y sudo 
RUN    apt-get install -y mariadb-server
RUN    mkdir -p /home/hmrabet/data/mariadb
COPY   config/init.sh /init.sh
RUN    chmod +x /init.sh

EXPOSE 3306

CMD ["/init.sh"]
