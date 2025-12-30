import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaStore, 
  FaBoxOpen, 
  FaClipboardList, 
  FaRupeeSign, 
  FaShoppingCart, 
  FaArrowLeft,
  FaChartLine,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';
import { FiPackage, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import { getPharmacyDashboard } from '../../redux/slices/vendorSlice';
import { p } from 'framer-motion/client';

const PharmacyDashboard = () => {
  const { pharmacyId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboard, loading, error } = useSelector(state => state.vendor);

  useEffect(() => {
    if (pharmacyId) {
      dispatch(getPharmacyDashboard(pharmacyId));
    }
  }, [dispatch, pharmacyId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/vendor/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </Card>
        </div>
      </Layout>
    );
  }

  const dashboardData = dashboard || {};
  const pharmacy = dashboardData.pharmacy || {};
  const stats = dashboardData.stats || {};

  return (
    <Layout>
      <div className="mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/vendor/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to All Pharmacies</span>
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <FaStore className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{pharmacy.name? pharmacy.name :<p>N/A</p>}</h1>
                <p className="text-gray-600 mt-1">{pharmacy.address}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    <FaCheckCircle className="inline mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/vendor/manage-inventory', { state: { pharmacyId } })}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <FaBoxOpen />
                <span>Manage Inventory</span>
              </button>
              <button
                onClick={() => navigate('/vendor/orders', { state: { pharmacyId } })}
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200 flex items-center gap-2"
              >
                <FaClipboardList />
                <span>View Orders</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FaRupeeSign className="text-3xl text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-4xl font-bold text-green-700 mt-1">
                    ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-green-200">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <FiTrendingUp className="text-green-600" />
                  All time earnings
                </p>
              </div>
            </Card>

            {/* Total Orders */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FaShoppingCart className="text-3xl text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-4xl font-bold text-blue-700 mt-1">{stats.totalOrders || 0}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600">Completed orders</p>
              </div>
            </Card>

            {/* Pending Orders */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FaClock className="text-3xl text-yellow-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-4xl font-bold text-yellow-700 mt-1">{stats.pendingOrders || 0}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-yellow-200">
                <p className="text-xs text-gray-600">Awaiting processing</p>
              </div>
            </Card>

            {/* Completed Orders */}
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FaCheckCircle className="text-3xl text-indigo-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                  <p className="text-4xl font-bold text-indigo-700 mt-1">{stats.completedOrders || 0}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-indigo-200">
                <p className="text-xs text-gray-600">Successfully delivered</p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Additional Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Net Profit */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FiTrendingUp className="text-3xl text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-4xl font-bold text-purple-700 mt-1">
                    ₹{(stats.netProfit || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-purple-200">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <FiTrendingUp className="text-purple-600" />
                  Total profit earned
                </p>
              </div>
            </Card>

            {/* Total Medicines Sold */}
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <FiPackage className="text-3xl text-teal-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Medicines Sold</p>
                  <p className="text-4xl font-bold text-teal-700 mt-1">
                    {(stats.totalMedicinesSold || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-teal-200">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <FiPackage className="text-teal-600" />
                  Total units sold
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/vendor/inventory', { state: { pharmacyId } })}
            >
              <div className="text-center py-6">
                <div className="inline-flex p-4 bg-blue-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  <FaBoxOpen className="text-3xl text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Add Medicine</h3>
                <p className="text-sm text-gray-600">Add new medicines to inventory</p>
              </div>
            </Card>

            <Card 
              className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/vendor/orders', { state: { pharmacyId } })}
            >
              <div className="text-center py-6">
                <div className="inline-flex p-4 bg-green-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  <FaClipboardList className="text-3xl text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Process Orders</h3>
                <p className="text-sm text-gray-600">View and manage orders</p>
              </div>
            </Card>

            <Card 
              className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/vendor/sales', { state: { pharmacyId } })}
            >
              <div className="text-center py-6">
                <div className="inline-flex p-4 bg-purple-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  <FaChartLine className="text-3xl text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">View Sales</h3>
                <p className="text-sm text-gray-600">Check sales analytics</p>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PharmacyDashboard;
