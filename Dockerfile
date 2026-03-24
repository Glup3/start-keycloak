FROM node:24-slim AS base

###

FROM base AS prod
WORKDIR /app
COPY package.json package-lock.json /app
RUN npm ci

COPY . /app
RUN npm run build

###

FROM base
COPY --from=prod /app/.output /app/.output
EXPOSE 3000

CMD ["node", "/app/.output/server/index.mjs"]
