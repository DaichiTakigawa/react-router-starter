import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('editor/:projectId', 'routes/editor/project.tsx'),
] satisfies RouteConfig;
