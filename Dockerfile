FROM node:18.12.1-alpine As build
LABEL org.opencontainers.image.source="https://github.com/luismij/cumbi"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . ./

CMD [ "node", "app.js" ]
