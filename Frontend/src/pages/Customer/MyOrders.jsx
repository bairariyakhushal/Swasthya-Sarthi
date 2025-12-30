import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaShoppingBag, FaTruck, FaStore, FaFilter } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import { getMyOrders } from '../../redux/slices/customerSlice';
import { formatCurrency, formatOrderStatus, getStatusColor } from '../../utils/formatters';
import { DELIVERY_TYPES } from '../../utils/constants';

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector(state => state.customer);
  const { isAuthenticated, token } = useSelector(state => state.auth);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(getMyOrders('all'));
    }
  }, [dispatch, isAuthenticated, token]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleTrackOrder = (orderId) => {
    navigate(`/customer/track-order/${orderId}`);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
  };

  // Filter orders by status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === statusFilter);

  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.orderPlacedAt) - new Date(a.orderPlacedAt)
  );

  const orderStatusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.orderStatus === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.orderStatus === 'confirmed').length },
    { value: 'assigned', label: 'Assigned', count: orders.filter(o => o.orderStatus === 'assigned').length },
    { value: 'picked_up', label: 'Picked Up', count: orders.filter(o => o.orderStatus === 'picked_up').length },
    { value: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter(o => o.orderStatus === 'out_for_delivery').length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.orderStatus === 'delivered').length },
    { value: 'ready_for_pickup', label: 'Ready for Pickup', count: orders.filter(o => o.orderStatus === 'ready_for_pickup').length },
    { value: 'completed', label: 'Completed', count: orders.filter(o => o.orderStatus === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.orderStatus === 'cancelled').length },
  ];

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <Button onClick={() => navigate('/customer/search')}>
            <FaShoppingBag className="mr-2" />
            Order More
          </Button>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filter by Status</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {orderStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label} {option.count > 0 && `(${option.count})`}
              </button>
            ))}
          </div>
        </Card>

        {sortedOrders.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FaShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
              </p>
              <Button onClick={() => navigate('/customer/search')}>Start Shopping</Button>
            </div>
          </Card>
        ) : selectedOrder ? (
          // Detailed Order View
          <Card>
            <div className="mb-4">
              <button
                onClick={handleCloseDetails}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                ← Back to Orders
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {formatOrderStatus(selectedOrder.orderStatus)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(selectedOrder.orderPlacedAt || selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="mt-3 md:mt-0">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(selectedOrder.totalAmount)}
                </p>
              </div>
            </div>

            {/* Pharmacy Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-800">{selectedOrder.pharmacy?.name}</p>
              <p className="text-sm text-gray-600">{selectedOrder.pharmacy?.address}</p>
              <p className="text-sm text-gray-500">📞 {selectedOrder.pharmacy?.contactNumber}</p>
            </div>

            {/* Delivery Type */}
            <div className="mb-4 flex items-center gap-2">
              {selectedOrder.deliveryType === DELIVERY_TYPES.DELIVERY ? (
                <>
                  <FaTruck className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Home Delivery</span>
                </>
              ) : (
                <>
                  <FaStore className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Store Pickup</span>
                  {selectedOrder.pickupCode && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">
                      Code: {selectedOrder.pickupCode}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Delivery Address */}
            {selectedOrder.deliveryType === DELIVERY_TYPES.DELIVERY && selectedOrder.deliveryAddress && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Delivery Address:</p>
                <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p>
              </div>
            )}

            {/* Medicines */}
            <div className="mb-4">
              <p className="font-semibold text-gray-700 mb-2">Items:</p>
              <div className="space-y-2">
                {selectedOrder.medicines.map((medicine, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">
                      {medicine.medicineName} × {medicine.quantity}
                    </span>
                    <span className="text-gray-800 font-medium">
                      {formatCurrency(medicine.total)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Medicine Total:</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(selectedOrder.medicineTotal || 0)}</span>
                </div>
                {selectedOrder.deliveryType === 'delivery' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charges:</span>
                    <span className="text-gray-800 font-medium">{formatCurrency(selectedOrder.deliveryCharges || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-800">Total Amount:</span>
                  <span className="text-blue-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
              <p className="font-semibold text-emerald-900 mb-2 text-sm">💳 Payment Information</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-700">Payment Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                    selectedOrder.paymentStatus === 'completed' || selectedOrder.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : selectedOrder.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.paymentStatus ? selectedOrder.paymentStatus.toUpperCase() : 'PENDING'}
                  </span>
                </div>
                {selectedOrder.razorpayPaymentId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Payment ID:</span>
                    <span className="text-emerald-900 font-mono text-xs">{selectedOrder.razorpayPaymentId}</span>
                  </div>
                )}
                {selectedOrder.razorpayOrderId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Order ID:</span>
                    <span className="text-emerald-900 font-mono text-xs">{selectedOrder.razorpayOrderId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prescription Status */}
            {selectedOrder.needsPrescription && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  📋 Prescription Required
                  {selectedOrder.prescriptionStatus && (
                    <span className="ml-2">
                      - Status: {selectedOrder.prescriptionStatus.toUpperCase()}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Volunteer Info */}
            {selectedOrder.volunteer && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  🚴 Delivery Partner: {selectedOrder.volunteer.firstName} {selectedOrder.volunteer.lastName}
                </p>
                <p className="text-sm text-green-700">
                  Vehicle: {selectedOrder.volunteer.vehicleType} - {selectedOrder.volunteer.vehicleNumber}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleTrackOrder(selectedOrder._id)}
                className="flex items-center gap-2"
              >
                <FaEye />
                Track Order
              </Button>
            </div>
          </Card>
        ) : (
          // Compact Order List
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <Card key={order._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {formatOrderStatus(order.orderStatus)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <FaStore className="inline mr-1" />
                        {order.pharmacy?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.orderPlacedAt || order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        {order.deliveryType === DELIVERY_TYPES.DELIVERY ? (
                          <>
                            <FaTruck className="text-blue-600" />
                            <span className="text-gray-600">Home Delivery</span>
                          </>
                        ) : (
                          <>
                            <FaStore className="text-green-600" />
                            <span className="text-gray-600">Store Pickup</span>
                          </>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{order.medicines.length} item(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                      className="flex items-center gap-2"
                    >
                      <FaEye />
                      View Details
                    </Button>
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

export default MyOrders;
