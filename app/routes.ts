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
      route(':id', 'routes/main/clients/detail.tsx'),
      route(':id/edit', 'routes/main/clients/edit.tsx'),
    ]),
  ]),

  // Logout Route
  route('logout', 'routes/logout.tsx', { id: 'logout' }),

  // Catch-all route for 404 errors - must be last
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
