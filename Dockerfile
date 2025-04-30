# Stage 1: build the frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/front-end
COPY front-end/package*.json ./
RUN npm install --production=false
COPY front-end/ .
RUN npm run build

# Stage 2: install backend dependencies
FROM node:18-alpine AS backend-build
WORKDIR /app/back-end
COPY back-end/package*.json ./
RUN npm install --production
COPY back-end/ .

# Stage 3: final image
FROM node:18-alpine AS production
WORKDIR /app

# Copy backend code and dependencies
COPY --from=backend-build /app/back-end .

# Copy built frontend into a public directory the Express server can serve
COPY --from=frontend-build /app/front-end/dist ./public

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Expose the port your server listens on
EXPOSE 10000

# Start the Express server (must serve static from ./public)
CMD ["node", "server.js"] 