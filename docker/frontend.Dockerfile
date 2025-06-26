# docker/frontend.Dockerfile

FROM node:20

WORKDIR /app

COPY ./frontend/package*.json ./
RUN npm install

COPY ./frontend .

ENV PATH "/app/node_modules/.bin:$PATH"

EXPOSE 3000

CMD ["npm", "run", "dev"]

