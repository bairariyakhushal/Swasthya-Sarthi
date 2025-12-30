import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, toggleAvailability, updateLocation } from '../../redux/slices/volunteerSlice';
import Layout from '../../components/layouts/Layout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { FiToggleLeft, FiToggleRight, FiAlertCircle, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getCurrentLocation } from '../../utils/location';

const VolunteerHome = () => {
  const dispatch = useDispatch();
  const { profile, isAvailable, currentLocation, loading, error } = useSelector((state) => state.volunteer);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const handleToggleAvailability = () => {
    dispatch(toggleAvailability({ isAvailable: !isAvailable }));
  };

  const handleUpdateLocation = async () => {
    setUpdatingLocation(true);
    try {
      const location = await getCurrentLocation();
      await dispatch(updateLocation(location));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingLocation(false);
    }
  };

  // Show error state
  if (error && !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Backend Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500 mb-4">
                This is a backend authentication issue. Please check your backend logs.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show pending status
  if (!profile || profile.approvalStatus === 'pending') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto text-6xl text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Under Review</h2>
              <p className="text-gray-600 mb-6">
                Your volunteer registration is pending admin approval. We'll notify you once it's reviewed.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  <strong>Status:</strong> Pending Approval
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show rejected status
  if (profile.approvalStatus === 'rejected') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto text-6xl text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Rejected</h2>
              <p className="text-gray-600 mb-4">
                Unfortunately, your volunteer registration was not approved.
              </p>
              {profile.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-red-800">
                    <strong>Reason:</strong> {profile.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Approved volunteer dashboard
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your deliveries and availability</p>
          </div>
          
          <Button
            variant={isAvailable ? 'success' : 'secondary'}
            icon={isAvailable ? <FiToggleRight /> : <FiToggleLeft />}
            onClick={handleToggleAvailability}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-sm font-medium text-gray-600">Total Deliveries</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{profile.totalDeliveries || 0}</p>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-gray-600">Rating</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{profile.rating || 0} ⭐</p>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-gray-600">Active Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{profile.activeOrders?.length || 0}</p>
          </Card>
        </div>

        {/* Location Card */}
        <Card className="mb-8 border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <FiMapPin className="text-blue-600" />
                Current Location
              </h2>
              {currentLocation || profile.currentLocation ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Latitude:</span> {currentLocation?.latitude || profile.currentLocation?.latitude}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Longitude:</span> {currentLocation?.longitude || profile.currentLocation?.longitude}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Keep your location updated for better order matching
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No location set. Update your location to receive orders.</p>
              )}
            </div>
            <Button
              variant="primary"
              icon={<FiMapPin />}
              onClick={handleUpdateLocation}
              loading={updatingLocation}
              className="ml-4"
            >
              {updatingLocation ? 'Updating...' : 'Update Location'}
            </Button>
          </div>
        </Card>

        {/* Profile Info */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Vehicle Type</p>
              <p className="font-medium capitalize">{profile.vehicleType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle Number</p>
              <p className="font-medium">{profile.vehicleNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Area</p>
              <p className="font-medium">{profile.serviceArea?.city} ({profile.serviceArea?.radius} km radius)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default VolunteerHome;
