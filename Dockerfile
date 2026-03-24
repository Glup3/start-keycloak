FROM node:24-slim AS base

###

FROM base AS prod
WORKDIR /app
COPY package.json package-lock.json /app
RUN npm install

COPY . /app
RUN npm run build

###

FROM base
COPY --from=prod /app/dist/server /app/dist/server
EXPOSE 3000

CMD ["node", "/app/dist/server/server.js"]
