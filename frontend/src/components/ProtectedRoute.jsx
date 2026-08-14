import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { member, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-gate-loading">
        <div className="auth-gate-spinner"></div>
        <div className="star-divider" aria-hidden="true">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
        <p>Loading GBSG Portal...</p>
      </div>
    );
  }

  if (!member) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
