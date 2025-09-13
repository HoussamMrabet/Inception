FROM debian:12

RUN apt-get update -y && apt-get upgrade -y

RUN apt-get install -y vsftpd

COPY conf/ftp.conf /etc/ftp/ftp.conf

COPY tools/ftp.sh /usr/local/bin/ftp.sh

RUN chmod +x /usr/local/bin/ftp.sh

EXPOSE 20 21 30000-30009

ENTRYPOINT [ "/usr/local/bin/ftp.sh" ]