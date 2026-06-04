FROM node:22

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["pnpm", "start:dev"]