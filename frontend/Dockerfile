# Stage 1: Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime stage (serve with nginx)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/dist .

# Create non-root user for security
RUN addgroup -g 1001 -S nginx_user && adduser -S nginx_user -u 1001
RUN chown -R nginx_user:nginx_user /usr/share/nginx/html /var/cache/nginx /var/log/nginx /var/run

# Switch to non-root user
USER nginx_user

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
