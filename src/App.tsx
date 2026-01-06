import { RouterProvider, Outlet } from 'react-router-dom';
import { createAppRouter } from './shared/router/utils';
import { routes } from './app/routes';
import { Layout } from './shared/components/Layout';

const router = createAppRouter(
  routes,
  <Layout routes={routes}>
    <Outlet />
  </Layout>
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
