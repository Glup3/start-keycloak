FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

###

FROM base AS prod
WORKDIR /app
COPY package.json pnpm-lock.yaml /app
RUN pnpm install --frozen-lockfile

COPY . /app
RUN pnpm run build

###

FROM base
COPY --from=prod /app/.output /app/.output
EXPOSE 3000

CMD ["node", "/app/.output/server/index.mjs"]
