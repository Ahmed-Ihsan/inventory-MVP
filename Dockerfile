FROM cydl-backend:latest

# Switch to root to install packages
USER root

# Install nginx, supervisor, and zbar (for barcode scanning)
RUN apt-get update && \
    apt-get install -y nginx supervisor libzbar0 && \
    rm -rf /var/lib/apt/lists/* && \
    rm /etc/nginx/sites-enabled/default

# Copy and install backend dependencies
COPY backend/requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt && rm /tmp/requirements.txt

# Copy local backend code to override the image's backend
COPY backend/ /app/

# Copy pre-built frontend
COPY frontend/build /usr/share/nginx/html

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/sites-enabled/default

# Copy supervisord config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p /app/backend/data

# Expose port 80 for nginx
EXPOSE 80

# Set entrypoint and default command
ENTRYPOINT ["/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
