import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { member, loading } = useAuth();

  if (loading) {
    return <div className="container section">Loading...</div>;
  }

  if (!member) {
    return <Navigate to="/login" replace />;
  }

  if (member.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
