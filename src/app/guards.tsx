import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';

export function RequireSession() {
  const { session } = useApp();
  const location = useLocation();

  if (!session) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
