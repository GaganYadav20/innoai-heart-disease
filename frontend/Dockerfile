# ============================================
# CardioVision AI - Frontend Dockerfile
# Multi-stage: Node build → Nginx serve
# ============================================

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Build args for environment
ARG VITE_API_URL=/api
ARG VITE_AI_URL=/ai

# Set environment for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_URL=$VITE_AI_URL

# Copy package files first for caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
