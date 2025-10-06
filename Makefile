COMPOSE_FILE = srcs/docker-compose.yml

all:
	@mkdir -p /home/$(USER)/data/wordpress
	@mkdir -p /home/$(USER)/data/mariadb
	docker compose -f $(COMPOSE_FILE) up --build -d

down:
	docker compose -f $(COMPOSE_FILE) down --volumes

clean:
	docker compose -f $(COMPOSE_FILE) down --volumes --remove-orphans

fclean: clean
	docker compose -f $(COMPOSE_FILE) down --rmi all -v --remove-orphans
	docker system prune -a --volumes -f
	@sudo rm -rf /home/$(USER)/data/*

re: fclean all
