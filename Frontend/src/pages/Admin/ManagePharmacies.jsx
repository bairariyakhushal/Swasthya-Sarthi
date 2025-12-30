import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaStore, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt, FaPhone, FaBox, FaUser } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import { getPharmacies } from '../../redux/slices/adminSlice';
import { APPROVAL_STATUS } from '../../utils/constants';

const ManagePharmacies = () => {
  const dispatch = useDispatch();
  const { pharmacies, loading } = useSelector(state => state.admin);
  const [statusFilter, setStatusFilter] = useState('approved');

  useEffect(() => {
    dispatch(getPharmacies(statusFilter));
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

  const PharmacyCard = ({ pharmacy }) => (
    <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 bg-gradient-to-br from-white to-blue-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <FaStore className="text-2xl text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{pharmacy.name}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaUser className="text-xs" />
              {pharmacy.owner?.firstName} {pharmacy.owner?.lastName}
            </p>
          </div>
        </div>
        {getStatusBadge(pharmacy.approvalStatus)}
      </div>

      {/* License & GST */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">License Number</p>
          <p className="font-semibold text-gray-900 text-sm">{pharmacy.licenseNumber}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">GST Number</p>
          <p className="font-semibold text-gray-900 text-sm">{pharmacy.gstNumber || 'N/A'}</p>
        </div>
      </div>

      {/* Address */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 mb-3 border border-indigo-100">
        <p className="text-xs text-indigo-700 mb-1 font-medium flex items-center gap-1">
          <FaMapMarkerAlt /> Address
        </p>
        <p className="text-sm text-gray-800">{pharmacy.address}</p>
      </div>

      {/* Contact & Inventory */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <FaPhone className="text-xs" /> Contact
          </p>
          <p className="font-semibold text-gray-900 text-sm">{pharmacy.contactNumber}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <FaBox className="text-xs" /> Inventory
          </p>
          <p className="font-semibold text-gray-900 text-sm">{pharmacy.inventory?.length || 0} items</p>
        </div>
      </div>

      {/* Coordinates & Registration */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Coordinates</p>
          <p className="font-mono text-xs text-gray-700">
            {pharmacy.coordinates?.latitude?.toFixed(4)}, {pharmacy.coordinates?.longitude?.toFixed(4)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Registered</p>
          <p className="font-semibold text-gray-900 text-xs">
            {new Date(pharmacy.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Approval Details */}
      {pharmacy.approvalStatus === APPROVAL_STATUS.APPROVED && pharmacy.approvedBy && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs text-green-700 font-semibold mb-1.5 flex items-center gap-1">
            <FaCheckCircle /> Approval Details
          </p>
          <p className="text-xs text-gray-700">
            <span className="font-medium">Admin:</span> {pharmacy.approvedBy.firstName} {pharmacy.approvedBy.lastName}
          </p>
          {pharmacy.approvedAt && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Date:</span> {new Date(pharmacy.approvedAt).toLocaleString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      )}

      {/* Rejection Details */}
      {pharmacy.approvalStatus === APPROVAL_STATUS.REJECTED && pharmacy.rejectionReason && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 border border-red-200">
          <p className="text-xs text-red-700 font-semibold mb-1 flex items-center gap-1">
            <FaTimesCircle /> Rejection Reason
          </p>
          <p className="text-sm text-gray-800">{pharmacy.rejectionReason}</p>
        </div>
      )}
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Manage Pharmacies
          </h1>
          <p className="text-gray-600">View and manage all registered pharmacies</p>
        </div>

        {/* Status Filter */}
        <Card className="mb-6 border-2 border-blue-100 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
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
              Approved ({pharmacies.filter(p => p.approvalStatus === 'approved').length})
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
              Pending ({pharmacies.filter(p => p.approvalStatus === 'pending').length})
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
              Rejected ({pharmacies.filter(p => p.approvalStatus === 'rejected').length})
            </button>
          </div>
        </Card>

        {/* Pharmacies Grid */}
        {pharmacies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map(pharmacy => (
              <PharmacyCard key={pharmacy._id} pharmacy={pharmacy} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No {statusFilter} pharmacies found
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ManagePharmacies;
