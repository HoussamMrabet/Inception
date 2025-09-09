FROM debian:12

RUN    apt-get update && apt-get install -y sudo 
RUN    apt-get install -y mariadb-server
COPY   config/init.sh /init.sh
RUN    chmod +x /init.sh

EXPOSE 3306

CMD ["/init.sh"]

# CMD ["mysqld_safe", "--port=3306", "--bind-address=0.0.0.0", "--datadir=/var/lib/mysql"]