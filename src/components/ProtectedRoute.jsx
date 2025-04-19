import { useEffect } from 'react';
import { useAuth } from "../pages/Login/AuthContext.jsx"
import { useNavigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { student, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !student) {
      navigate('/login');
    }
  }, [student, loading, navigate]);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  
  return student ? <Outlet /> : null;
};

export default ProtectedRoute;