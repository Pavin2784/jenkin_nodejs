FROM node:latest

WORKDIR /app

COPY . /app

RUN npm install express mysql2 dotenv

EXPOSE 3000

CMD ["node" , "server.js"]
