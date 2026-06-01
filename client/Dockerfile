FROM node:20-alpine

WORKDIR /app

# Copy dependency configs
COPY package.json ./

# Install packages
RUN npm install

# Copy application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev"]
