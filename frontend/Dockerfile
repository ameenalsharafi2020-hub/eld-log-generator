FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build app
RUN npm run build

# Install serve for production
RUN npm install -g serve

# Start app
CMD ["serve", "-s", "build", "-l", "3000"]