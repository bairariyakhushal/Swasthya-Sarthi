import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStore, FaBoxOpen, FaClipboardList, FaPlus, FaCheckCircle, FaClock, FaTimesCircle, FaShieldAlt, FaChartLine, FaMapMarkerAlt, FaPhone, FaArrowRight } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import { getVendorPharmacies } from '../../redux/slices/vendorSlice';
import { APPROVAL_STATUS } from '../../utils/constants';

const VendorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pharmacies, loading } = useSelector(state => state.vendor);

  const { error } = useSelector(state => state.vendor);

  useEffect(() => {
    dispatch(getVendorPharmacies());
  }, [dispatch]);

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
            <FaClock /> Pending Approval
          </span>
        );
      default:
        return null;
    }
  };

  const approvedPharmacies = Array.isArray(pharmacies) ? pharmacies.filter(p => p.approvalStatus === APPROVAL_STATUS.APPROVED) : [];
  const pendingPharmacies = Array.isArray(pharmacies) ? pharmacies.filter(p => p.approvalStatus === APPROVAL_STATUS.PENDING) : [];
  const rejectedPharmacies = Array.isArray(pharmacies) ? pharmacies.filter(p => p.approvalStatus === APPROVAL_STATUS.REJECTED) : [];

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Vendor Dashboard</h1>
          <Button onClick={() => navigate('/vendor/register-pharmacy')} className="flex items-center gap-2">
            <FaPlus />
            Register New Pharmacy
          </Button>
        </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 space-y-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-primary-light via-white to-accent-cyan-light  p-8 sm:p-12 overflow-hidden "
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Vendor Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
                <FaShieldAlt className="text-blue-600 text-lg" />
                <span className="font-semibold text-gray-800">Trusted Pharmacy Partner</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Manage Your
                <span className="text-blue-600 block">Pharmacy Network</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
                Register pharmacies, manage inventory, track orders, and grow your business with our comprehensive vendor platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/vendor/register-pharmacy')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaPlus />
                  <span>Register New Pharmacy</span>
                </button>
                <button
                  onClick={() => navigate('/vendor/orders')}
                  className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaClipboardList />
                  <span>View Orders</span>
                </button>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="flex-shrink-0 hidden lg:block">
              <div className="relative w-72 h-72">
                {/* Floating Icons Animation */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-0 p-4 bg-white rounded-2xl shadow-xl"
                >
                  <FaStore className="text-5xl text-blue-600" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-0 left-0 p-4 bg-white rounded-2xl shadow-xl"
                >
                  <FaBoxOpen className="text-4xl text-indigo-600" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded-2xl shadow-xl"
                >
                  <FaChartLine className="text-4xl text-green-600" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FaStore className="text-3xl text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Total Pharmacies</p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{pharmacies.length}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600">Registered pharmacies</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FaCheckCircle className="text-3xl text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-4xl font-bold text-green-700 mt-1">{approvedPharmacies.length}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-green-200">
                <p className="text-xs text-gray-600">Active & operational</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FaClock className="text-3xl text-yellow-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-4xl font-bold text-yellow-700 mt-1">{pendingPharmacies.length}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-yellow-200">
                <p className="text-xs text-gray-600">Awaiting approval</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FaTimesCircle className="text-3xl text-red-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-4xl font-bold text-red-700 mt-1">{rejectedPharmacies.length}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-red-200">
                <p className="text-xs text-gray-600">Need attention</p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Pharmacies List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Pharmacies</h2>
            <button
              onClick={() => navigate('/vendor/register-pharmacy')}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <FaPlus />
              <span className="hidden sm:inline">Add New</span>
            </button>
          </div>
        
          {pharmacies.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
              <div className="text-center py-16">
                <div className="inline-flex p-6 bg-blue-100 rounded-full mb-4">
                  <FaStore className="text-6xl text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Pharmacies Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start by registering your first pharmacy to begin managing inventory and receiving orders.
                </p>
                <button
                  onClick={() => navigate('/vendor/register-pharmacy')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200"
                >
                  Register Your First Pharmacy
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pharmacies.map((pharmacy) => (
                <motion.div
                  key={pharmacy._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <Card 
                    className="h-full bg-[#e0f5f432]   hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => pharmacy.approvalStatus === APPROVAL_STATUS.APPROVED && navigate(`/vendor/pharmacy/${pharmacy._id}/dashboard`)}
                  >
                    {/* Header with Status Badge */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                          <FaStore className="text-2xl text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{pharmacy.name}</h3>
                        </div>
                      </div>
                      {getStatusBadge(pharmacy.approvalStatus)}
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-gray-400 text-sm mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-600 line-clamp-2">{pharmacy.address}</p>
                      </div>
                    </div>

                    {/* Contact & Inventory */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FaPhone className="text-gray-400 text-xs" />
                          <p className="text-xs text-gray-500 font-medium">Contact</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 truncate">{pharmacy.contactNumber}</p>
                      </div>
                    </div>

                    {/* Status Messages */}
                    {pharmacy.approvalStatus === APPROVAL_STATUS.PENDING && (
                      <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg mb-4">
                        <p className="text-xs text-yellow-800 font-medium">
                          ⏳ Awaiting admin approval. You'll be notified once reviewed.
                        </p>
                      </div>
                    )}

                    {pharmacy.approvalStatus === APPROVAL_STATUS.REJECTED  && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-lg mb-4">
                        <p className="text-xs font-bold text-red-800 mb-1">Rejection Reason:</p>
                        <p className="text-xs text-red-700 line-clamp-2">{pharmacy.rejectionReason?
                        pharmacy.rejectionReason: <p> please check your mail </p>}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {pharmacy.approvalStatus === APPROVAL_STATUS.APPROVED && (
                      <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/vendor/pharmacy/${pharmacy._id}/dashboard`);
                          }}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <FaChartLine />
                          <span>Dashboard</span>
                        </button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
