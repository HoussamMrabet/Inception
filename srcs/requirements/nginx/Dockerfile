FROM debian

RUN apt-get update && apt-get install -y nginx openssl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/ssl
RUN openssl req -x509 -nodes -out /etc/nginx/ssl/nginx.crt \
    -keyout /etc/nginx/ssl/nginx.key -subj "/CN=${DOMAIN_NAME}"

COPY conf/default.conf /etc/nginx/conf.d/

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]