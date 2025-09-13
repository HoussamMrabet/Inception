#!/bin/bash

mkdir -p /var/run/vsftpd/empty
mkdir -p $FTP_DIR

useradd -m $FTP_USER

echo "${FTP_USER}:${FTP_PASS}" | chpasswd

chown -R $FTP_USER:$FTP_USER $FTP_DIR
chmod -R u=rwx,g=rx,o=rx $FTP_DIR

vsftpd /etc/ftp/ftp.conf