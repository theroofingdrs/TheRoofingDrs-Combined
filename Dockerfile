FROM node:22-slim

WORKDIR /app

COPY package.json ./package.json
COPY index.html ./index.html
COPY source-apps/trd/package.json ./source-apps/trd/package.json
COPY source-apps/crd/package.json ./source-apps/crd/package.json

RUN npm install --prefix source-apps/trd && npm install --prefix source-apps/crd

COPY . .

RUN npm --prefix source-apps/trd run build && npm --prefix source-apps/crd run build

ENV NODE_ENV=production
CMD ["node", "server.mjs"]
