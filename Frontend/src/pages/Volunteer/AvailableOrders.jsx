import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableOrders, acceptOrder } from '../../redux/slices/volunteerSlice';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import { FiPackage, FiMapPin, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';

const AvailableOrders = () => {
  const dispatch = useDispatch();
  const { availableOrders, loading, profile } = useSelector((state) => state.volunteer);

  useEffect(() => {
    if (profile && profile.approvalStatus === 'approved' && profile.isAvailable) {
      dispatch(getAvailableOrders());
    }
  }, [dispatch, profile]);

  const handleAcceptOrder = async (orderId) => {
    const result = await dispatch(acceptOrder(orderId));
    if (!result.error) {
      // Refresh available orders list after accepting
      dispatch(getAvailableOrders());
      // Note: We don't refresh profile here to avoid resetting availability status
      // The volunteer should remain available to accept more orders
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiCheckCircle />, label: 'Confirmed' },
      ready_for_pickup: { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FiPackage />, label: 'Ready for Pickup' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null, label: status };

    return (
      <span className={`flex items-center gap-1 px-3 py-1.5 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>
        {config.icon} {config.label}
      </span>
    );
  };

  if (!profile || profile.approvalStatus !== 'approved') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-indigo-50">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-4xl text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Approved</h2>
              <p className="text-gray-600">Your volunteer profile needs to be approved by admin to view available orders.</p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!profile.isAvailable) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-amber-50">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiTruck className="text-4xl text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Currently Offline</h2>
              <p className="text-gray-600 mb-4">Toggle your availability from the Home page to start receiving delivery requests.</p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Available Deliveries
          </h1>
          <p className="text-gray-500">Accept orders and start delivering medicines</p>
        </div>

        {loading ? (
          <Loader />
        ) : availableOrders.length === 0 ? (
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-emerald-50">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-4xl text-emerald-500" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No available orders at the moment</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for new delivery requests</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <Card key={order.orderId} className="hover:shadow-xl hover:border-emerald-200 transition-all duration-200 border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Order Details */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Order #{order._id?.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.orderPlacedAt).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(order.orderStatus)}
                    </div>

                    {/* Pharmacy Info */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                      <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center text-xs">🏪</span>
                        Pickup From
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">Pharmacy:</span> {order.pharmacy?.name}
                        </p>
                        <p className="text-sm text-gray-700 flex items-start gap-2">
                          <FiMapPin className="mt-1 flex-shrink-0 text-indigo-600" />
                          <span>{order.pharmacy?.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Customer & Delivery Info */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                      <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-emerald-200 rounded-lg flex items-center justify-center text-xs">👤</span>
                        Deliver To
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">Customer:</span> {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">Contact:</span> {order.contactNumber}
                        </p>
                        <p className="text-sm text-gray-700 flex items-start gap-2">
                          <FiMapPin className="mt-1 flex-shrink-0 text-emerald-600" />
                          <span>{order.deliveryAddress}</span>
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-xs">💊</span>
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {order.medicines?.map((med, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm pb-2 border-b border-gray-100 last:border-0">
                            <div>
                              <span className="text-gray-900 font-semibold">{med.medicineName}</span>
                              <span className="text-gray-500 ml-2 text-xs">x {med.quantity}</span>
                            </div>
                            <span className="font-bold text-gray-900">
                              ₹{(med.price * med.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mt-3 p-3 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-blue-600">₹{order.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-4 border border-emerald-100 sticky top-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-emerald-200 rounded-lg flex items-center justify-center text-xs">⚡</span>
                        Delivery Details
                      </h4>
                      
                      <div className="space-y-3 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Estimated Distance</p>
                          <p className="text-sm font-bold text-gray-900">
                            {order.distance ? `${order.distance} km` : 'Calculating...'}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            order.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {order.paymentStatus?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptOrder(order.orderId)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg flex items-center justify-center gap-2"
                        disabled={loading}
                      >
                        <FiCheckCircle /> Accept Delivery
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AvailableOrders;
