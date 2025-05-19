# Single-stage backend only (frontend will be built separately by Render)
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy backend files
COPY package*.json ./
RUN npm install --production
COPY . ./

# Set production environment
ENV NODE_ENV=production

EXPOSE 5001
CMD ["node", "server.js"]
