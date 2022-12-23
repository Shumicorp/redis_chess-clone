FROM node:16
ADD . /app
WORKDIR /app
RUN npm install -g npm@9.2.0
RUN npm run build
ENV SERVER_PORT 8080
EXPOSE 8080
CMD npm run start