FROM mcr.microsoft.com/playwright:v1.61.1-noble

WORKDIR /app

# Install dependencies first so this layer is cached until package files change
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
