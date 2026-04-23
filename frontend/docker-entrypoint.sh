#!/bin/sh
set -eu

: "${BACKEND_HOST:=backend}"
: "${BACKEND_PORT:=3000}"

envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'

