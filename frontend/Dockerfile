# Stage 1: Build Angular app
FROM node:20 AS build

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of source code
COPY . .

# Run build (config script + ng build)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from build stage
# Project name is FYP → dist/FYP/browser
COPY --from=build /app/dist/FYP/browser /usr/share/nginx/html

# Copy nginx config for Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
