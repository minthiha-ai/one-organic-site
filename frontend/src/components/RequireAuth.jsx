import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function GuestOnly({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return null;
  if (isAuthenticated) return <Navigate to="/account" replace />;
  return children;
}
