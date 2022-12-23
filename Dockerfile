FROM node:14
ADD . /app
WORKDIR /app
RUN npm install npm@9.2.0 -g
RUN npm run build
ENV SERVER_PORT 8080
EXPOSE 8080 6379
CMD npm run start