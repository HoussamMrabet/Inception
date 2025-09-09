#!/bin/bash

service mariadb start

mariadb -e "CREATE DATABASE $MDB_NAME"
mariadb -e "CREATE USER '$MDB_USER'@'%' IDENTIFIED BY '$MDB_PASS'"
mariadb -e "GRANT ALL PRIVILEGES ON $MDB_NAME.* TO '$MDB_USER'@'%'"
mariadb -e "FLUSH PRIVILEGES"

service mariadb stop

exec mysqld_safe --port=3306 --bind-address=0.0.0.0 --datadir='/var/lib/mysql'