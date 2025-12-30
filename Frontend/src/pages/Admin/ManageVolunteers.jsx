import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserFriends, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaMotorcycle, FaPhone, FaMapMarkerAlt, FaIdCard, FaStar, FaTruck } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import { getVolunteers } from '../../redux/slices/adminSlice';
import { APPROVAL_STATUS } from '../../utils/constants';

const ManageVolunteers = () => {
  const dispatch = useDispatch();
  const { volunteers, loading } = useSelector(state => state.admin);
  const [statusFilter, setStatusFilter] = useState('approved');

  useEffect(() => {
    dispatch(getVolunteers(statusFilter));
  }, [dispatch, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case APPROVAL_STATUS.APPROVED:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <FaCheckCircle /> Approved
          </span>
        );
      case APPROVAL_STATUS.REJECTED:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <FaTimesCircle /> Rejected
          </span>
        );
      case APPROVAL_STATUS.PENDING:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <FaClock /> Pending
          </span>
        );
      default:
        return null;
    }
  };

  const VolunteerCard = ({ volunteer }) => (
    <Card className="bg-gradient-to-br from-white to-green-50 border-2 border-green-100 hover:border-green-200 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-green-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
            {volunteer.profilePhoto ? (
              <img
                src={volunteer.profilePhoto}
                alt={volunteer.user?.firstName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <FaUserFriends className="text-2xl text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {volunteer.user?.firstName} {volunteer.user?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{volunteer.user?.email}</p>
          </div>
        </div>
        {getStatusBadge(volunteer.approvalStatus)}
      </div>

      <div className="space-y-3">
        {/* Contact & Age */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <FaPhone className="text-green-500" />
              <p className="text-xs text-gray-500 font-medium">Contact</p>
            </div>
            <p className="font-bold text-gray-900 text-base">
              {volunteer.user?.contactNumber || 'N/A'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <FaUserFriends className="text-green-500" />
              <p className="text-xs text-gray-500 font-medium">Age</p>
            </div>
            <p className="font-bold text-gray-900 text-base">{volunteer.age} years</p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <FaMotorcycle className="text-white" />
            </div>
            <p className="text-sm font-bold text-gray-700">Vehicle Information</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Type</p>
              <p className="font-semibold text-gray-800">{volunteer.vehicleType?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Number</p>
              <p className="font-semibold text-gray-800">{volunteer.vehicleNumber}</p>
            </div>
          </div>
        </div>

        {/* Driving License */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FaIdCard className="text-green-500" />
            <p className="text-xs text-gray-500 font-medium">Driving License</p>
          </div>
          <p className="font-semibold text-gray-800">{volunteer.drivingLicense}</p>
        </div>

        {/* Service Area */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <FaMapMarkerAlt className="text-white" />
            </div>
            <p className="text-sm font-bold text-gray-700">Service Area</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500 text-xs">City</p>
              <p className="font-semibold text-gray-800">{volunteer.serviceArea?.city}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Radius</p>
              <p className="font-semibold text-gray-800">{volunteer.serviceArea?.radius} km</p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FaTruck className="text-green-500" />
              <p className="text-xs text-gray-500 font-medium">Deliveries</p>
            </div>
            <p className="font-semibold text-gray-800">{volunteer.totalDeliveries || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FaStar className="text-yellow-500" />
              <p className="text-xs text-gray-500 font-medium">Rating</p>
            </div>
            <p className="font-semibold text-gray-800">⭐ {volunteer.rating?.toFixed(1) || 'N/A'}</p>
          </div>
        </div>

        {/* Status & Registration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="font-semibold">
              {volunteer.isAvailable ? (
                <span className="text-green-600">● Available</span>
              ) : (
                <span className="text-gray-500">● Unavailable</span>
              )}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Registered On</p>
            <p className="font-semibold text-gray-800 text-xs">
              {new Date(volunteer.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-blue-50 rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-600 font-medium mb-2 flex items-center gap-2">
            <FaEye className="text-blue-500" />
            Documents:
          </p>
          <div className="flex gap-2 flex-wrap">
            {volunteer.drivingLicenseDocument && (
              <a
                href={volunteer.drivingLicenseDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
              >
                <FaIdCard /> DL
              </a>
            )}
            {volunteer.aadharDocument && (
              <a
                href={volunteer.aadharDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
              >
                <FaIdCard /> Aadhar
              </a>
            )}
            {volunteer.profilePhoto && (
              <a
                href={volunteer.profilePhoto}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
              >
                <FaUserFriends /> Photo
              </a>
            )}
          </div>
        </div>

        {/* Approval Details */}
        {volunteer.approvalStatus === APPROVAL_STATUS.APPROVED && volunteer.approvedBy && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 shadow-sm border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-green-600" />
              <p className="text-sm font-bold text-green-700">Approved</p>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-gray-600">
                <span className="font-medium">By:</span> {volunteer.approvedBy.firstName} {volunteer.approvedBy.lastName}
              </p>
              {volunteer.approvedAt && (
                <p className="text-gray-600">
                  <span className="font-medium">On:</span> {new Date(volunteer.approvedAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {volunteer.approvalStatus === APPROVAL_STATUS.REJECTED && volunteer.rejectionReason && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 shadow-sm border-2 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <FaTimesCircle className="text-red-600" />
              <p className="text-sm font-bold text-red-700">Rejection Reason</p>
            </div>
            <p className="text-sm text-gray-700">{volunteer.rejectionReason}</p>
          </div>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Manage Volunteers
          </h1>
          <p className="text-gray-600">View and manage all registered delivery volunteers</p>
        </div>

        {/* Status Filter */}
        <Card className="mb-6 border-2 border-green-100 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                statusFilter === 'approved'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <FaCheckCircle className="inline mr-2" />
              Approved ({volunteers.filter(v => v.approvalStatus === 'approved').length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                statusFilter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <FaClock className="inline mr-2" />
              Pending ({volunteers.filter(v => v.approvalStatus === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                statusFilter === 'rejected'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <FaTimesCircle className="inline mr-2" />
              Rejected ({volunteers.filter(v => v.approvalStatus === 'rejected').length})
            </button>
          </div>
        </Card>

        {/* Volunteers Grid */}
        {volunteers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteers.map(volunteer => (
              <VolunteerCard key={volunteer._id} volunteer={volunteer} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No {statusFilter} volunteers found
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ManageVolunteers;
