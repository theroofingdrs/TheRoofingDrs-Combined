import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'node:fs';
import { applyResidentialMetadata, type Metadata } from '../../shared/seo/html.ts';
import { publishedBlogPost, publishedResidentialMetadata } from '../../shared/seo/blog.ts';
import { apiV1Router } from './server/api/v1/router.ts';

dotenv.config();

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const PORT = Number(process.env.PORT) || 3000;

  // Mount API routes FIRST
  app.use('/api/v1', apiV1Router);

  // Fallback endpoint for generic health
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'The Roof Doctors Platform' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const html = fs.readFileSync(path.join(distPath, 'index.html'),'utf8');
    const manifest: Record<string,Metadata> = JSON.parse(fs.readFileSync(path.join(distPath,'seo-manifest.json'),'utf8'));
    app.use(express.static(distPath,{index:false}));
    app.get('*', async (req, res) => {
      // Match the existing case-sensitive client dispatcher; do not consolidate
      // aliases or silently turn /faq/ (a fallback page) into the /faq screen.
      const route = req.path || '/';
      res.set('Cache-Control','no-cache');
      // Preserve the existing non-public portal/staff shell and auth behavior.
      if (route.startsWith('/app') || route.startsWith('/field') || route.startsWith('/portal')) return res.type('html').send(html);
      let fallback: Metadata = {...manifest['/__fallback'],canonicalPath:route,schemaJson:undefined};
      if (route.startsWith('/service-areas/')) fallback=manifest['/service-areas/'+(route.split('/')[2]||'texarkana')] || manifest['/service-areas/__unknown__'];
      else if (route.startsWith('/blog/')) fallback=manifest['/blog'];
      else if (route.startsWith('/insurance-claims')) fallback={...manifest['/insurance-claims'],canonicalPath:route};
      else if (route.startsWith('/storm-damage')) {
        const storm = route.includes('hail') ? '/storm-damage/hail-damage' : route.includes('wind') ? '/storm-damage/wind-damage' : route.includes('fallen-tree') ? '/storm-damage/fallen-tree-damage' : route.includes('what-to-do') ? '/storm-damage/what-to-do' : '/storm-damage';
        fallback={...manifest[storm],canonicalPath:route};
      }
      let metadata = manifest[route] || fallback;
      if(/^\/blog\/[^/]+$/.test(route)) {
        const result = await publishedBlogPost('TRD',route.slice('/blog/'.length));
        if(result.post)metadata=publishedResidentialMetadata(result.post);
      }
      res.type('html').send(applyResidentialMetadata(html,metadata,route==='/'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RoofDoctors] Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('[RoofDoctors] Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`[RoofDoctors] Port ${PORT} is in use. Exiting cleanly to allow supervisor restart.`);
      process.exit(1);
    }
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('[RoofDoctors] Failed to start server:', err);
  process.exit(1);
});
