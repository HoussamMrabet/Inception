FROM debian:12

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

COPY tools/requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

COPY app/ .

COPY tools/start-monitor.sh /start-monitor.sh
RUN chmod +x /start-monitor.sh

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["/start-monitor.sh"]
