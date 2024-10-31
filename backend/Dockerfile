FROM node:22.11-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG ENV
# Copies the correct .env file based on ENV
COPY .env.${ENV} .env  

EXPOSE 8080

CMD ["npm", "start"]


