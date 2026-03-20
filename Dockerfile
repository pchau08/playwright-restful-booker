FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Default command runs the full suite
CMD ["npx", "playwright", "test"]
