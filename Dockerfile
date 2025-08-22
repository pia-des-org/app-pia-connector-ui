# Stage 1: Compile and Build angular codebase
FROM node:lts as build

ARG BASE_PATH=/

WORKDIR /app
COPY ./ /app/
RUN npm install
RUN npm run build -- --base-href=$BASE_PATH

# Stage 2: Serve app with nginx
FROM nginx:alpine
COPY --from=build /app/deployment/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/edc-demo-client /usr/share/nginx/html
COPY --from=build /app/src/assets /usr/share/nginx/html/assets
# Copy FNMT certificates for mTLS
COPY --from=build /app/certs/mtls/fnmt-root.pem /etc/nginx/ssl/fnmt-root.pem
COPY --from=build /app/certs/mtls/fnmt-usuarios.pem /etc/nginx/ssl/fnmt-usuarios.pem
# Copy server SSL certificates
COPY --from=build /app/certs/mtls/server.crt /etc/nginx/ssl/server.crt
COPY --from=build /app/certs/mtls/server.key /etc/nginx/ssl/server.key
COPY --from=build /app/certs/mtls/server.pfx /etc/nginx/ssl/server.pfx
# Create directory and set permissions
RUN mkdir -p /etc/nginx/ssl && chmod -R 600 /etc/nginx/ssl
# Create combined certificate file for client verification
RUN cat /etc/nginx/ssl/fnmt-root.pem /etc/nginx/ssl/fnmt-usuarios.pem > /etc/nginx/ssl/fnmt-combined.pem
RUN chown -R nginx:nginx /usr/share/nginx/

EXPOSE 80 443

# Install curl for health checks
RUN apk add --no-cache curl

HEALTHCHECK --interval=2s --timeout=5s --retries=10 \
  CMD curl -fsS http://localhost/ || exit 1
