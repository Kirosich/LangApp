# --- Stage 1: build the React client ---
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Stage 2: production server ---
FROM node:20-alpine
WORKDIR /app

# better-sqlite3 needs build tools to compile its native addon on install
RUN apk add --no-cache python3 make g++

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /app/server
CMD ["node", "index.js"]
