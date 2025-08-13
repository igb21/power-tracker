# 🧱 Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# 🗃️ Stage 2: Runtime
FROM node:18-alpine AS runner

WORKDIR /app

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/db.sqlite ./db.sqlite
COPY --from=builder /app/.env ./.env

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
