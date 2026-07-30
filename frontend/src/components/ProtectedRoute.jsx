import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { member, loading } = useAuth();

  if (loading) {
    return <div className="container section">Loading...</div>;
  }

  if (!member) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
