# Use the specific node image required
FROM node:22-alpine as builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Remove existing yarn binary
RUN rm -rf /usr/local/bin/yarn

# Copy the rest of the application code
COPY . .

# Use a lightweight image for production
FROM nginx:alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

