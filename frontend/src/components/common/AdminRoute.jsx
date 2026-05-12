import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
