FROM node:22-slim AS builder

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- runtime ----
FROM node:22-slim

WORKDIR /app
# Astro standalone build includes its own node_modules snapshot
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Persistent data directory (mounted via PVC in k8s)
RUN mkdir -p /app/src/data

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
