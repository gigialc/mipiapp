# Dockerfile para reverse-proxy
FROM nginx:alpine

# Instalar certbot y otros paquetes necesarios
RUN apk add --no-cache certbot certbot-nginx openssl

# Copiar los archivos de configuración de Nginx
COPY ./docker/nginx.conf.template /nginx.conf
COPY ./docker/nginx-ssl.conf.template /nginx-ssl.conf

# Copiar el script de inicio
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

# Crear directorios necesarios para certbot
RUN mkdir -p /var/www/certbot /etc/letsencrypt

# Exponer los puertos necesarios
EXPOSE 80 443

# Configurar el script de inicio
CMD ["/start.sh"]
