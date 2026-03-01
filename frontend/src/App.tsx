import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import OwnerDashboard from './pages/OwnerDashboard';
import GuestView from './pages/GuestView';

// Root route with Layout wrapper
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Child routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const ownerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner',
  component: OwnerDashboard,
});

const guestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guest',
  component: GuestView,
});

// Router
const routeTree = rootRoute.addChildren([homeRoute, ownerRoute, guestRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
