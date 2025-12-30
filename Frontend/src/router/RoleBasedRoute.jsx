import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user?.accountType)) {
    // Redirect to appropriate dashboard based on user accountType
    const roleRoutes = {
      Customer: '/customer/home',
      Vendor: '/vendor/dashboard',
      Volunteer: '/volunteer/home',
      Admin: '/admin/dashboard',
    };
    
    return <Navigate to={roleRoutes[user?.accountType] || '/'} replace />;
  }

  return children;
};

export default RoleBasedRoute;
