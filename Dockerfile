FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code and config files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify dist folder exists and has content
RUN ls -la dist/ && ls -la dist/src/*.js || (echo "ERROR: Build failed or dist folder is empty" && exit 1)

EXPOSE 4001

# Use production start command - NestJS builds to dist/src/
CMD ["node", "dist/src/main.js"]