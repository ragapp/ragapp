FROM node:20-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev && rm -rf /var/cache/apk/* > /dev/null 2>&1

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app
COPY package*.json ./
RUN npm install

COPY . .
RUN chown -R node:node /opt/app
USER node

RUN ["npm", "run", "build"]
EXPOSE 1337

CMD ["npm", "run", "develop"] 