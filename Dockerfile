FROM node:22-slim

WORKDIR /app

# Vite embeds these public Supabase values into the browser bundles at build time.
# They must be supplied as Docker build arguments. Never pass the service role key here.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}

# Copy once so constrained build environments do not duplicate the entire
# application across dependency and source snapshots. Generated files, raw
# incoming media, credentials and local data are excluded by .dockerignore.
COPY . .
RUN --mount=type=secret,id=proxy_ca --mount=type=tmpfs,target=/root/.npm \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm run install:apps && npm run build

ENV NODE_ENV=production
CMD ["node", "server.mjs"]
