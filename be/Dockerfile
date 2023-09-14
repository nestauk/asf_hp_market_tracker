FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
COPY package.json .
COPY ./src ./src
RUN yarn install
ENV HOST=0.0.0.0 PORT=3000
CMD ["npm", "run", "dev"]
EXPOSE 3000