# DEV STAGE
FROM node:22

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package*.json ./

RUN pnpm install

COPY . .

RUN npx prisma generate


EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]