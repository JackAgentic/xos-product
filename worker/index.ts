// Cloudflare Worker entry point
// Adapts existing Express-style API handlers to the Fetch API

interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

// Lazy-loaded handler modules (loaded on first request, after process.env is set)
const handlerImports = {
  auth: () => import('../api/auth/[[...action]].ts'),
  clients: () => import('../api/clients/index.ts'),
  contacts: () => import('../api/contacts/index.ts'),
  tasks: () => import('../api/tasks/index.ts'),
  opportunities: () => import('../api/opportunities/index.ts'),
  meetings: () => import('../api/meetings/index.ts'),
  notes: () => import('../api/notes/index.ts'),
  dashboard: () => import('../api/dashboard/index.ts'),
  financials: () => import('../api/financials/[[...type]].ts'),
  activities: () => import('../api/activities/index.ts'),
  documents: () => import('../api/documents/index.ts'),
  communications: () => import('../api/communications/index.ts'),
} as const;

// Routes with catch-all params (e.g. /api/auth/login → paramName='action', paramValue='login')
const paramRoutes: Record<string, string> = {
  auth: 'action',
  financials: 'type',
};

// Cached handler modules
const handlerCache: Record<string, { default: (req: any, res: any) => Promise<void> }> = {};

async function getHandler(name: string) {
  if (!handlerCache[name]) {
    const importer = handlerImports[name as keyof typeof handlerImports];
    if (!importer) return null;
    handlerCache[name] = await importer();
  }
  return handlerCache[name].default;
}

// Convert Fetch Request → Express-like req object
async function toExpressReq(request: Request, url: URL, routeParams: Record<string, string> = {}) {
  const headers: Record<string, string | undefined> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  // Merge route params into query (how Vercel/Express catch-all params work)
  Object.assign(query, routeParams);

  let body: any = null;
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  return {
    method: request.method,
    headers,
    query,
    body,
    params: routeParams,
  };
}

// Create Express-like res object that builds a Response
function createExpressRes() {
  let statusCode = 200;
  const headers = new Headers();
  let body: string | null = null;
  let ended = false;

  const res: any = {
    get headersSent() { return ended; },
    status(code: number) { statusCode = code; return res; },
    json(data: any) {
      ended = true;
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(data);
      return res;
    },
    setHeader(name: string, value: string) {
      headers.set(name, String(value));
      return res;
    },
    end() {
      ended = true;
      return res;
    },
  };

  const getResponse = () => new Response(body, { status: statusCode, headers });
  return { res, getResponse };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Populate process.env from Worker bindings (needed before handler modules init)
    process.env.DATABASE_URL = env.DATABASE_URL;
    process.env.JWT_SECRET = env.JWT_SECRET;

    const url = new URL(request.url);
    const path = url.pathname;

    // Only handle /api/* routes — everything else is served from assets
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // Parse: /api/{routeName}/{param?}
    const parts = path.replace(/^\/api\//, '').split('/');
    const routeName = parts[0];
    const paramValue = parts[1] || undefined;

    const handler = await getHandler(routeName);
    if (!handler) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build route params for catch-all routes
    const routeParams: Record<string, string> = {};
    const paramName = paramRoutes[routeName];
    if (paramName && paramValue) {
      routeParams[paramName] = paramValue;
    }

    try {
      const req = await toExpressReq(request, url, routeParams);
      const { res, getResponse } = createExpressRes();
      await handler(req, res);
      return getResponse();
    } catch (err) {
      console.error(`Error in /api/${routeName}:`, err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
