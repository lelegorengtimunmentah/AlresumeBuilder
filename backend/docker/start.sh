#!/bin/sh
set -e

echo "==> Starting AlresumeBuilder backend..."

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
  echo "==> Generating APP_KEY..."
  php artisan key:generate --force
fi

# Run migrations
echo "==> Running database migrations..."
php artisan migrate --force

# Clear & rebuild caches
echo "==> Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set storage permissions
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# Start supervisor (nginx + php-fpm + queue worker)
echo "==> Starting services via supervisord..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
