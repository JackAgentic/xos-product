import express from 'express';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// Route definitions mapping URL paths to Vercel handler modules
const routes: Array<{
  path: string;
  paramName?: string;
  module: string;
}> = [
  { path: '/api/auth', paramName: 'action', module: '../api/auth/[[...action]].ts' },
  { path: '/api/clients', module: '../api/clients/index.ts' },
  { path: '/api/contacts', module: '../api/contacts/index.ts' },
  { path: '/api/tasks', module: '../api/tasks/index.ts' },
  { path: '/api/opportunities', module: '../api/opportunities/index.ts' },
  { path: '/api/meetings', module: '../api/meetings/index.ts' },
  { path: '/api/notes', module: '../api/notes/index.ts' },
  { path: '/api/dashboard', module: '../api/dashboard/index.ts' },
  { path: '/api/financials', paramName: 'type', module: '../api/financials/[[...type]].ts' },
  { path: '/api/activities', module: '../api/activities/index.ts' },
  { path: '/api/documents', module: '../api/documents/index.ts' },
  { path: '/api/communications', module: '../api/communications/index.ts' },
];

for (const route of routes) {
  const modulePath = path.resolve(__dirname, route.module);

  const handler = async (req: any, res: any) => {
    // Merge route params into req.query (Vercel handlers read catch-all values from req.query)
    // Express 5 makes req.query read-only, so we use Object.defineProperty to override it
    if (route.paramName && req.params[route.paramName]) {
      const mergedQuery = { ...req.query, [route.paramName]: req.params[route.paramName] };
      Object.defineProperty(req, 'query', { value: mergedQuery, writable: true, configurable: true });
    }

    try {
      const mod = await import(modulePath);
      await mod.default(req, res);
    } catch (err) {
      console.error(`Error in ${route.path}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  if (route.paramName) {
    // Register both /api/auth and /api/auth/:action for catch-all routes
    app.all(route.path, handler);
    app.all(`${route.path}/:${route.paramName}`, handler);
  } else {
    app.all(route.path, handler);
  }
}

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
});
