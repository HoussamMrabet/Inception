COMPOSE_FILE = srcs/docker-compose.yml

all:
	docker compose -f $(COMPOSE_FILE) up --build -d

down:
	docker compose -f $(COMPOSE_FILE) down

clean:
	docker compose -f $(COMPOSE_FILE) down --remove-orphans

fclean:
	docker compose -f $(COMPOSE_FILE) down --rmi all -v --remove-orphans

re: fclean all
