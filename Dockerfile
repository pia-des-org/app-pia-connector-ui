# Stage 1: Compile and Build angular codebase
FROM node:lts as build

ARG BASE_PATH=/

WORKDIR /app
COPY ./ /app/
RUN npm install
RUN npm install libs/\@think-it-labs/edc-connector-client/
RUN npm run build -- --base-href=$BASE_PATH

# Stage 2: Serve app with nginx
FROM nginx:alpine
COPY --from=build /app/deployment/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/edc-demo-client /usr/share/nginx/html
COPY --from=build /app/src/assets /usr/share/nginx/html/assets
RUN chown -R nginx:nginx /usr/share/nginx/
EXPOSE 80

HEALTHCHECK --interval=2s --timeout=5s --retries=10 \
  CMD curl -f http://localhost/ || exit 1
