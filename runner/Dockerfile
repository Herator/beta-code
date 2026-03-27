FROM node:22-slim

# Install Docker CLI so the worker can spawn cpp-sandbox containers
RUN apt-get update && apt-get install -y --no-install-recommends \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/runner
COPY package.json ./
RUN npm install

COPY worker.js ./

RUN mkdir -p /app/runner/jobs

CMD ["node", "worker.js"]
