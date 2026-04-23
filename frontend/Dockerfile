# syntax=docker/dockerfile:1

FROM alpine:3.20 AS assets
WORKDIR /src
COPY index.html app.js nginx.conf.template docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

FROM nginx:1.27-alpine AS runtime
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=3000
COPY --from=assets /src/index.html /usr/share/nginx/html/index.html
COPY --from=assets /src/app.js /usr/share/nginx/html/app.js
COPY --from=assets /src/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=assets /src/docker-entrypoint.sh /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]

