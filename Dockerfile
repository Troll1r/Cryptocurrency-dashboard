FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
ARG VITE_COINGECKO_API_KEY
ARG VITE_COINGECKO_API_BASE_URL
ENV VITE_COINGECKO_API_KEY=${VITE_COINGECKO_API_KEY}
ENV VITE_COINGECKO_API_BASE_URL=${VITE_COINGECKO_API_BASE_URL}
RUN pnpm build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist .

RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run /etc/nginx/conf.d && \
    chmod 755 /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
