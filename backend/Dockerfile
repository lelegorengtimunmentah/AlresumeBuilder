# ─────────────────────────────────────────────
# Stage 1: Install Composer dependencies
# ─────────────────────────────────────────────
FROM composer:2.9 AS composer-build

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --ignore-platform-reqs

# ─────────────────────────────────────────────
# Stage 2: Final image
# ─────────────────────────────────────────────
FROM php:8.2-fpm-alpine

# Install system dependencies & PHP extensions
RUN apk add --no-cache \
    nginx \
    supervisor \
    nodejs \
    npm \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    unzip \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        zip \
        pcntl \
        bcmath \
        opcache \
        intl

WORKDIR /var/www/html

# Copy vendor from build stage
COPY --from=composer-build /app/vendor ./vendor

# Copy application source
COPY . .

# Install Node deps for PDF generator script
RUN npm ci --omit=dev

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Supervisor config (nginx + php-fpm + queue worker)
COPY docker/supervisord.conf /etc/supervisord.conf

# Start script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
