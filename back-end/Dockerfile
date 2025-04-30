# Stage 1: Build Front-end
FROM node:18-alpine AS frontend
WORKDIR /usr/src/front-end
COPY front-end/package*.json ./
RUN npm install --production=false
COPY front-end/ ./
RUN npm run build

# Stage 2: Install Back-end dependencies
FROM node:18-alpine AS backend
WORKDIR /usr/src/app
COPY back-end/package*.json ./
RUN npm install --production
COPY back-end/ ./

# Stage 3: Production Image
FROM node:18-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy back-end artifacts
COPY --from=backend /usr/src/app/ ./
# Copy front-end built assets
COPY --from=frontend /usr/src/front-end/dist/ ./public

EXPOSE 10000
CMD ["node", "server.js"]
