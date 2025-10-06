FROM debian:12

RUN apt-get update && apt-get install -y nginx openssl && rm -rf /var/lib/apt/lists/*

COPY conf/default.conf /etc/nginx/conf.d/

COPY tools/init_ssl_certificat.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/init_ssl_certificat.sh

EXPOSE 443

ENTRYPOINT ["/usr/local/bin/init_ssl_certificat.sh"]


# CMD ["nginx", "-g", "daemon off;"]