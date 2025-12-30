import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getMyDeliveries, 
  markPickupComplete, 
  markOutForDelivery, 
  markDeliveryComplete 
} from '../../redux/slices/volunteerSlice';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import Modal from '../../components/ui/Modal';
import { FiPackage, FiMapPin, FiCheckCircle, FiTruck, FiClock, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const MyDeliveries = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { deliveries, loading } = useSelector((state) => state.volunteer);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    dispatch(getMyDeliveries());
  }, [dispatch]);

  const handleUpdateStatus = (order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (selectedOrder && newStatus) {
      let result;
      
      // Call the appropriate API based on status
      if (newStatus === 'picked_up') {
        result = await dispatch(markPickupComplete(selectedOrder._id));
      } else if (newStatus === 'out_for_delivery') {
        result = await dispatch(markOutForDelivery(selectedOrder._id));
      } else if (newStatus === 'delivered') {
        result = await dispatch(markDeliveryComplete(selectedOrder._id));
      }
      
      if (!result.error) {
        setShowStatusModal(false);
        dispatch(getMyDeliveries());
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiClock />, label: 'Assigned' },
      picked_up: { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FiPackage />, label: 'Picked Up' },
      out_for_delivery: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <FiTruck />, label: 'Out for Delivery' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle />, label: 'Delivered' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <FiCheckCircle />, label: 'Completed' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null, label: status };

    return (
      <span className={`flex items-center gap-1 px-3 py-1.5 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const filteredDeliveries = deliveries.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ['assigned', 'picked_up', 'out_for_delivery'].includes(order.orderStatus);
    if (statusFilter === 'completed') return ['delivered', 'completed'].includes(order.orderStatus);
    return order.orderStatus === statusFilter;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Deliveries
          </h1>
          <p className="text-gray-500">Track and manage your delivery orders</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border border-indigo-100 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Deliveries
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === 'active'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </Card>

        {loading ? (
          <Loader />
        ) : filteredDeliveries.length === 0 ? (
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-indigo-50">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-4xl text-indigo-500" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No deliveries found</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((order) => (
              <Card key={order._id} className="hover:shadow-xl hover:border-indigo-200 transition-all duration-200 border border-gray-200">
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
                        Pickup Location
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">Pharmacy:</span> {order.pharmacy?.name}
                        </p>
                        <p className="text-sm text-gray-700 flex items-start gap-2">
                          <FiMapPin className="mt-1 flex-shrink-0 text-indigo-600" />
                          <span>{order.pharmacy?.address}</span>
                        </p>
                        {order.pharmacy?.contactNumber && (
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <FiPhone className="text-indigo-600" />
                            <span>{order.pharmacy.contactNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer & Delivery Info */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                      <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-emerald-200 rounded-lg flex items-center justify-center text-xs">📍</span>
                        Delivery Location
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">Customer:</span> {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <FiPhone className="text-emerald-600" />
                          <span>{order.contactNumber}</span>
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
                        Order Items ({order.medicines?.length})
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

                  {/* Right Column: Actions */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 border border-indigo-100 sticky top-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center text-xs">⚡</span>
                        Quick Actions
                      </h4>
                      
                      <div className="space-y-2">
                        {/* Assigned - can mark as picked up */}
                        {order.orderStatus === 'assigned' && (
                          <button
                            onClick={() => handleUpdateStatus(order, 'picked_up')}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiPackage /> Mark as Picked Up
                          </button>
                        )}

                        {/* Picked Up - can mark as out for delivery */}
                        {order.orderStatus === 'picked_up' && (
                          <button
                            onClick={() => handleUpdateStatus(order, 'out_for_delivery')}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiTruck /> Start Delivery
                          </button>
                        )}

                        {/* Out for Delivery - can mark as delivered */}
                        {order.orderStatus === 'out_for_delivery' && (
                          <button
                            onClick={() => handleUpdateStatus(order, 'delivered')}
                            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiCheckCircle /> Mark as Delivered
                          </button>
                        )}

                        {/* Completed/Delivered */}
                        {(order.orderStatus === 'delivered' || order.orderStatus === 'completed') && (
                          <div className="text-center py-6 bg-white rounded-xl border border-gray-200">
                            <span className="text-3xl mb-2 block">✓</span>
                            <p className="text-sm font-medium text-gray-500">Delivery Completed</p>
                          </div>
                        )}

                        {/* Track Delivery Button */}
                        <button
                          onClick={() => navigate(`/volunteer/tracking/${order._id}`)}
                          className="w-full px-4 py-2.5 bg-white border-2 border-indigo-300 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                        >
                          <FiMapPin /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Delivery Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to update the delivery status to{' '}
            <span className="font-semibold text-gray-900">
              {newStatus?.replace(/_/g, ' ').toUpperCase()}
            </span>
            ?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowStatusModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={confirmStatusUpdate}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default MyDeliveries;
