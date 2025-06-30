import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  
  // Show loading state if auth is still being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-primary-200 h-12 w-12 mb-4"></div>
          <div className="h-4 bg-primary-100 rounded w-24 mb-2.5"></div>
          <div className="h-3 bg-primary-100 rounded w-16"></div>
        </div>
      </div>
    );
  }
  
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  
  // If user is logged in, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;