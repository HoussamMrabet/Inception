FROM python:3.11-slim

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app/ .

# Create data directory for storing monitoring data
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Run the monitoring service
CMD ["python", "monitor.py"]
