FROM node:18-alpine AS base

WORKDIR /app

# 预装 pnpm（使用 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 仅复制依赖清单，利用缓存
COPY package.json pnpm-lock.yaml ./

FROM base AS deps
RUN pnpm install --frozen-lockfile --prod

FROM base AS runner
ENV NODE_ENV=production

# 复制 node_modules 和源码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 8998

# 可通过环境变量 PORT 覆盖
CMD ["node", "src/app.js"]

# find . -name '._*' -delete
# docker build -t koa-app .
# 若 .env 位于仓库根目录，请在 server 目录运行：
# docker run -d --name koa-app -p 8998:8998 --env-file ../.env koa-app