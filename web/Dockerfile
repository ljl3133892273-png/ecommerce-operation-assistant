FROM node:22-slim AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-slim AS builder

WORKDIR /app
# 默认留空 = 使用相对路径。填绝对地址会在构建期固化进浏览器 JS，
# 换机器或换端口后浏览器仍会去请求旧地址，导致接口全部失败。
ARG NEXT_PUBLIC_API_BASE_URL=""
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS prod-deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=""
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=prod-deps /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
