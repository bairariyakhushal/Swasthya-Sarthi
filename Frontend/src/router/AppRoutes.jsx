import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Lazy load pages
import { lazy, Suspense } from 'react';
import Loader from '../components/common/Loader';
import RoleBasedRoute from './RoleBasedRoute';

// Auth Pages
const Login = lazy(() => import('../pages/Auth/Login'));
const Signup = lazy(() => import('../pages/Auth/Signup'));
const ProfileSelection = lazy(() => import('../pages/Auth/ProfileSelection'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));

// Customer Pages
const CustomerHome = lazy(() => import('../pages/Customer/CustomerHome'));
const SearchMedicine = lazy(() => import('../pages/Customer/SearchMedicine'));
const PharmacyDetails = lazy(() => import('../pages/Customer/PharmacyDetails'));
const Checkout = lazy(() => import('../pages/Customer/Checkout'));
const MyOrders = lazy(() => import('../pages/Customer/MyOrders'));
const TrackOrder = lazy(() => import('../pages/Customer/TrackOrder'));
const MedicineInfo = lazy(() => import('../pages/Customer/MedicineInfo'));
const SymptomChecker = lazy(() => import('../pages/Customer/SymptomChecker'));
const AIAssistant = lazy(() => import('../pages/Customer/AIAssistant'));

// Vendor Pages
const VendorDashboard = lazy(() => import('../pages/Vendor/VendorDashboard'));
const PharmacyDashboard = lazy(() => import('../pages/Vendor/PharmacyDashboard'));
const RegisterPharmacy = lazy(() => import('../pages/Vendor/RegisterPharmacy'));
const ManageInventory = lazy(() => import('../pages/Vendor/ManageInventory'));
const VendorOrders = lazy(() => import('../pages/Vendor/VendorOrders'));
const PharmacySales = lazy(() => import('../pages/Vendor/PharmacySales'));

// Volunteer Pages
const VolunteerHome = lazy(() => import('../pages/Volunteer/VolunteerHome'));
const AvailableOrders = lazy(() => import('../pages/Volunteer/AvailableOrders'));
const MyDeliveries = lazy(() => import('../pages/Volunteer/MyDeliveries'));
const DeliveryTracking = lazy(() => import('../pages/Volunteer/DeliveryTracking'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const PendingApprovals = lazy(() => import('../pages/Admin/PendingApprovals'));
const ManagePharmacies = lazy(() => import('../pages/Admin/ManagePharmacies'));
const ManageVolunteers = lazy(() => import('../pages/Admin/ManageVolunteers'));

// Landing Page
const LandingPage = lazy(() => import('../pages/LandingPage'));

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect to role-specific home if authenticated
  const getHomeRoute = () => {
    if (!isAuthenticated) return '/';
    
    switch (user?.accountType) {
      case 'Customer':
        return '/customer/home';
      case 'Vendor':
        return '/vendor/dashboard';
      case 'Volunteer':
        return '/volunteer/home';
      case 'Admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Root Route - Landing Page for unauthenticated, redirect to home for authenticated */}
        <Route 
          path="/" 
          element={!isAuthenticated ? <LandingPage /> : <Navigate to={getHomeRoute()} replace />} 
        />

        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getHomeRoute()} replace />} />
        <Route path="/signup" element={!isAuthenticated ? <ProfileSelection /> : <Navigate to={getHomeRoute()} replace />} />
        <Route path="/signup/:profileType" element={!isAuthenticated ? <Signup /> : <Navigate to={getHomeRoute()} replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Customer Routes */}
        <Route
          path="/customer/home"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <CustomerHome />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/search"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <SearchMedicine />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/pharmacy/:id"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <PharmacyDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/checkout"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <Checkout />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <MyOrders />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/track-order/:orderId"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <TrackOrder />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/medicine-info"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <MedicineInfo />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/symptom-checker"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <SymptomChecker />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/customer/ai-assistant"
          element={
            <RoleBasedRoute allowedRoles={['Customer']}>
              <AIAssistant />
            </RoleBasedRoute>
          }
        />

        {/* Vendor Routes */}
        <Route
          path="/vendor/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['Vendor']}>
              <VendorDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/vendor/pharmacy/:pharmacyId/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['Vendor']}>
              <PharmacyDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/vendor/register-pharmacy"
          element={
            <RoleBasedRoute allowedRoles={['Vendor']}>
              <RegisterPharmacy />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/vendor/inventory"
          element={
            <RoleBasedRoute allowedRoles={['Vendor']}>
              <ManageInventory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/vendor/orders"
          element={
            <RoleBasedRoute allowedRoles={['Vendor']}>
              <VendorOrders />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/vendor/sales"
          element={
            <RoleBasedRoute allowedRoles={['Vendor']}>
              <PharmacySales />
            </RoleBasedRoute>
          }
        />

        {/* Volunteer Routes */}
        <Route
          path="/volunteer/home"
          element={
            <RoleBasedRoute allowedRoles={['Volunteer']}>
              <VolunteerHome />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/volunteer/available-orders"
          element={
            <RoleBasedRoute allowedRoles={['Volunteer']}>
              <AvailableOrders />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/volunteer/deliveries"
          element={
            <RoleBasedRoute allowedRoles={['Volunteer']}>
              <MyDeliveries />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/volunteer/tracking/:orderId"
          element={
            <RoleBasedRoute allowedRoles={['Volunteer']}>
              <DeliveryTracking />
            </RoleBasedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <RoleBasedRoute allowedRoles={['Admin']}>
              <PendingApprovals />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/pharmacies"
          element={
            <RoleBasedRoute allowedRoles={['Admin']}>
              <ManagePharmacies />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/volunteers"
          element={
            <RoleBasedRoute allowedRoles={['Admin']}>
              <ManageVolunteers />
            </RoleBasedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
