# Use an official Node runtime as a base image
FROM node:22.11-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

ARG ENV
# Copies the correct .env file based on ENV
COPY .env.${ENV} .env  

# Build the frontend app
RUN npm run build

# Nginx for serving static files?
FROM nginx:alpine

COPY --from=0 /app/build /usr/share/nginx/html

# Expose port 80 = Nginx port to the outside world
EXPOSE 80

# Command to run the application
CMD ["nginx", "-g", "daemon off;"]
