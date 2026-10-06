# ── Étape 1 : BUILD — compiler le TypeScript ──
FROM node:22-alpine AS build
WORKDIR /app

# Manifestes d'abord : Docker réutilise le cache tant qu'ils ne changent pas
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Étape 2 : RUNTIME — image finale minimale ──
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]