import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  // Theme
  route('/resources/update-theme', 'routes/resources/update-theme.ts'),

  // Home Route
  route('/', 'routes/index.tsx', { id: 'home' }),

  // Private Routes
  layout('layouts/private.layouts.tsx', [
    route('clients', 'routes/main/clients/layout.tsx', [
      index('routes/main/clients/index.tsx'),
      route('new', 'routes/main/clients/new.tsx'),
      route(':clientID/edit', 'routes/main/clients/edit.tsx'),
      route(':clientID', 'routes/main/clients/details/layout.tsx', [
        index('routes/main/clients/details/index.tsx'),
        route('overview', 'routes/main/clients/details/overview.tsx'),
      ]),
    ]),
    route('analysis-configs', 'routes/main/analysis-configs/layout.tsx', [
      index('routes/main/analysis-configs/index.tsx'),
      route('new', 'routes/main/analysis-configs/new.tsx'),
      route(':analysisConfigID/edit', 'routes/main/analysis-configs/edit.tsx'),
      route(':analysisConfigID', 'routes/main/analysis-configs/details/layout.tsx', [
        index('routes/main/analysis-configs/details/index.tsx'),
        route('overview', 'routes/main/analysis-configs/details/overview.tsx'),
      ]),
    ]),
  ]),

  // Logout Route
  route('logout', 'routes/logout.tsx', { id: 'logout' }),

  // Catch-all route for 404 errors - must be last
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
