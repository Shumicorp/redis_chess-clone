FROM node:14-alpine

ADD . /app
WORKDIR /app
RUN npm run build
ENV SERVER_PORT 8080
EXPOSE 8080 6379
CMD npm run start