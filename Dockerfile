FROM node:22-slim

WORKDIR /app

# Vite embeds these public Supabase values into the browser bundles at build time.
# They must be supplied as Docker build arguments. Never pass the service role key here.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}

COPY package.json ./package.json
COPY index.html ./index.html
COPY source-apps/trd/package.json ./source-apps/trd/package.json
COPY source-apps/crd/package.json ./source-apps/crd/package.json

RUN npm install --prefix source-apps/trd && npm install --prefix source-apps/crd

COPY . .

RUN npm --prefix source-apps/trd run build && npm --prefix source-apps/crd run build

ENV NODE_ENV=production
CMD ["node", "server.mjs"]
