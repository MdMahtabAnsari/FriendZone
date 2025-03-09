FROM node:20.18.0

WORKDIR /app

# Copy package.json and package-lock.json separately to leverage Docker cache
COPY package*.json ./

# Install all dependencies since they’re all production dependencies
RUN npm ci
# Update npm to the latest version (or specify a version)
RUN npm install -g npm@latest
# Copy the rest of the app's code
COPY . .

# Expose the application's port
EXPOSE 3006

# Start the application
CMD ["npm", "start"]
