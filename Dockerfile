FROM node:argon
MAINTAINER Asbjørn Thegler <asbjoern@gmail.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app
RUN npm install

EXPOSE 3000

ENV NODE_ENV production

CMD [ "npm", "start" ]
