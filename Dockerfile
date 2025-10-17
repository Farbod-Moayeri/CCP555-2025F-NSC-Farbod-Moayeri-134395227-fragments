# A dockerfile for Docker containerization
FROM node:22.19.0

LABEL maintainer="Farbod Moayeri <fmoayeri2@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080
# Reduce npm spam when installing within Docker
# [URL documentation]
ENV NPM_CONFIG_LOGLEVEL=warn
# Disable colour when run inside Docker
# [URL documentation]
ENV NPM_CONFIG_COLOR=false

ENV HTPASSWD_FILE=/app/.htpasswd

# Use /app as our working directory
WORKDIR /app

# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/
COPY tests/.htpasswd /app/tests/.htpasswd

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080

# docker build -t fragments:latest .
# docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 -d fragments:latest
