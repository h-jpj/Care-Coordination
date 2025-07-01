FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3004

# Start preview server (serves built files)
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3004"]
