#FROM node:12.14.0-alpine3.11
FROM node:16.18.1-alpine


RUN apk add --no-cache bash

RUN npm install -g @nestjs/cli@9.2.0

USER node

WORKDIR /home/node/app