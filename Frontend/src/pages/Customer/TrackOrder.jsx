import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft, FaCheckCircle, FaStore, FaTruck, FaBox, FaShippingFast } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/common/Loader';
import { trackOrder } from '../../redux/slices/customerSlice';
import { formatCurrency, formatOrderStatus, getStatusColor } from '../../utils/formatters';
import { ORDER_STATUS, DELIVERY_TYPES } from '../../utils/constants';

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trackingData, loading } = useSelector(state => state.customer);

  useEffect(() => {
    if (orderId) {
      dispatch(trackOrder(orderId));
    }
  }, [dispatch, orderId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
      case ORDER_STATUS.CONFIRMED:
        return <FaBox className="text-blue-600" />;
      case ORDER_STATUS.READY_FOR_PICKUP:
        return <FaStore className="text-indigo-600" />;
      case ORDER_STATUS.ASSIGNED:
      case ORDER_STATUS.PICKED_UP:
        return <FaShippingFast className="text-purple-600" />;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return <FaTruck className="text-orange-600" />;
      case ORDER_STATUS.DELIVERED:
      case ORDER_STATUS.COMPLETED:
        return <FaCheckCircle className="text-green-600" />;
      default:
        return <FaBox className="text-gray-600" />;
    }
  };

  const getOrderTimeline = (order) => {
    const isDelivery = order.deliveryType === DELIVERY_TYPES.DELIVERY;
    
    if (isDelivery) {
      return [
        { 
          status: ORDER_STATUS.PENDING, 
          label: 'Order Placed', 
          description: 'Your order has been received',
          icon: FaBox, 
          timestamp: order.orderPlacedAt,
          color: 'blue'
        },
        { 
          status: ORDER_STATUS.CONFIRMED, 
          label: 'Order Confirmed', 
          description: 'Pharmacy confirmed your order',
          icon: FaCheckCircle, 
          timestamp: order.confirmedAt,
          color: 'green'
        },
        { 
          status: ORDER_STATUS.ASSIGNED, 
          label: 'Volunteer Assigned', 
          description: 'Delivery partner assigned',
          icon: FaShippingFast, 
          timestamp: order.assignedAt,
          color: 'purple'
        },
        { 
          status: ORDER_STATUS.PICKED_UP, 
          label: 'Picked Up from Pharmacy', 
          description: 'Order picked up by volunteer',
          icon: FaTruck, 
          timestamp: order.pickedUpAt,
          color: 'indigo'
        },
        { 
          status: ORDER_STATUS.OUT_FOR_DELIVERY, 
          label: 'Out for Delivery', 
          description: 'Your order is on the way',
          icon: FaTruck, 
          timestamp: order.outForDeliveryAt,
          color: 'orange'
        },
        { 
          status: ORDER_STATUS.DELIVERED, 
          label: 'Delivered', 
          description: 'Order successfully delivered',
          icon: FaCheckCircle, 
          timestamp: order.deliveredAt,
          color: 'green'
        },
      ];
    } else {
      return [
        { 
          status: ORDER_STATUS.PENDING, 
          label: 'Order Placed', 
          description: 'Your order has been received',
          icon: FaBox, 
          timestamp: order.orderPlacedAt,
          color: 'blue'
        },
        { 
          status: ORDER_STATUS.CONFIRMED, 
          label: 'Order Confirmed', 
          description: 'Pharmacy confirmed your order',
          icon: FaCheckCircle, 
          timestamp: order.confirmedAt,
          color: 'green'
        },
        { 
          status: ORDER_STATUS.READY_FOR_PICKUP, 
          label: 'Ready for Pickup', 
          description: 'Your order is ready at pharmacy',
          icon: FaStore, 
          timestamp: order.readyForPickupAt,
          color: 'purple'
        },
        { 
          status: ORDER_STATUS.COMPLETED, 
          label: 'Order Completed', 
          description: 'Successfully picked up',
          icon: FaCheckCircle, 
          timestamp: order.pickedUpByCustomerAt || order.completedAt,
          color: 'green'
        },
      ];
    }
  };

  const getStatusIndex = (currentStatus, timeline) => {
    const index = timeline.findIndex(step => step.status === currentStatus);
    // If current status not in timeline (e.g., cancelled), return -1
    return index;
  };

  const calculateProgress = (currentStatus, timeline) => {
    const currentIndex = getStatusIndex(currentStatus, timeline);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / timeline.length) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (!trackingData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <p className="text-center text-gray-500 py-8">Order not found</p>
            <div className="text-center">
              <Button onClick={() => navigate('/customer/orders')}>View All Orders</Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const tracking = trackingData;
  const timeline = getOrderTimeline({ 
    orderStatus: tracking.orderStatus, 
    deliveryType: tracking.deliveryType,
    orderPlacedAt: tracking.orderPlacedAt,
    confirmedAt: tracking.confirmedAt,
    assignedAt: tracking.assignedAt,
    pickedUpAt: tracking.pickedUpAt,
    outForDeliveryAt: tracking.outForDeliveryAt,
    deliveredAt: tracking.deliveredAt,
    readyForPickupAt: tracking.readyForPickupAt,
    pickedUpByCustomerAt: tracking.pickedUpByCustomerAt,
    completedAt: tracking.completedAt
  });
  const currentStatusIndex = getStatusIndex(tracking.orderStatus, timeline);
  const progressPercentage = tracking.progressPercentage || calculateProgress(tracking.orderStatus, timeline);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/customer/orders')}
          className="mb-6 flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to Orders
        </Button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Track Order</h1>

        {/* Order Info */}
        <Card className="mb-6 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-blue-100">
            <div className="mb-3 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{tracking.orderId.slice(-8).toUpperCase()}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>📅</span>
                {new Date(tracking.orderPlacedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(tracking.orderStatus)}`}>
                {formatOrderStatus(tracking.orderStatus)}
              </span>
              {tracking.orderStatus === ORDER_STATUS.CANCELLED && (
                <span className="text-xs text-red-600 font-medium">⚠️ Order was cancelled</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">🏪 PHARMACY</p>
              <p className="font-bold text-gray-900">{tracking.pharmacy?.name}</p>
              <p className="text-sm text-gray-600 mt-1">{tracking.pharmacy?.address}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 mb-2">💰 TOTAL AMOUNT</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatCurrency(tracking.totalAmount)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 mb-2">📦 DELIVERY TYPE</p>
            <div className="flex items-center gap-2">
              {tracking.deliveryType === DELIVERY_TYPES.DELIVERY ? (
                <>
                  <FaTruck className="text-purple-600" />
                  <span className="font-semibold text-gray-900">Home Delivery</span>
                </>
              ) : (
                <>
                  <FaStore className="text-green-600" />
                  <span className="font-semibold text-gray-900">Store Pickup</span>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {tracking.orderStatus !== ORDER_STATUS.CANCELLED && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-700">Order Progress</p>
                <p className="text-sm font-bold text-blue-600">{progressPercentage}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Pickup Code (for pickup orders) */}
        {tracking.deliveryType === 'pickup' && tracking.pickupCode && tracking.orderStatus !== ORDER_STATUS.CANCELLED && (
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="text-center">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
                <FaStore className="text-3xl text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-3">YOUR PICKUP CODE</p>
              <div className="bg-white rounded-xl p-6 shadow-lg inline-block">
                <p className="text-5xl font-bold text-blue-600 font-mono tracking-widest">
                  {tracking.pickupCode}
                </p>
              </div>
              <p className="text-sm text-gray-700 mt-4 max-w-md mx-auto">
                📱 Show this code at the pharmacy counter to collect your order
              </p>
              {tracking.orderStatus === ORDER_STATUS.READY_FOR_PICKUP && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg inline-block">
                  <p className="text-sm font-bold text-green-700">✓ Your order is ready for pickup!</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Delivery Address (for delivery orders) */}
        {tracking.deliveryType === 'delivery' && tracking.customer && (
          <Card className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Customer Details</p>
            <p className="text-gray-800">{tracking.customer.name}</p>
            <p className="text-sm text-gray-600">Contact: {tracking.customer.contact}</p>
          </Card>
        )}

        {/* Volunteer Info */}
        {tracking.volunteer && tracking.orderStatus !== ORDER_STATUS.CANCELLED && (
          <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FaShippingFast className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">DELIVERY PARTNER</p>
                <p className="text-lg font-bold text-gray-900">{tracking.volunteer.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">🚗 Vehicle</p>
                <p className="font-semibold text-gray-900">
                  {tracking.volunteer.vehicleType?.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 font-mono">{tracking.volunteer.vehicleNumber}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">📞 Contact</p>
                <p className="font-semibold text-gray-900">{tracking.volunteer.contact}</p>
              </div>
            </div>
            {tracking.deliveryDistance && (
              <div className="mt-3 bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">📍 Distance</p>
                <p className="font-semibold text-gray-900">{tracking.deliveryDistance.toFixed(2)} km</p>
              </div>
            )}
          </Card>
        )}

        {/* Order Timeline */}
        {tracking.orderStatus !== ORDER_STATUS.CANCELLED ? (
          <Card className="mb-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-blue-100 rounded-lg">
                <FaTruck className="text-blue-600" />
              </span>
              Order Timeline
            </h3>
            <div className="relative">
              {timeline.map((step, index) => {
                const isCompleted = step.timestamp || index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = step.icon;
                const colorClass = step.color || 'blue';

                return (
                  <div key={step.status} className="flex items-start mb-6 last:mb-0">
                    {/* Timeline Line */}
                    {index < timeline.length - 1 && (
                      <div
                        className={`absolute left-7 w-1 ${
                          isCompleted 
                            ? `bg-gradient-to-b from-${colorClass}-500 to-${colorClass}-400` 
                            : 'bg-gray-300'
                        }`}
                        style={{ 
                          top: `${index * 6 + 3.5}rem`,
                          height: '4rem'
                        }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-4 shadow-md transition-all ${
                        isCompleted
                          ? `bg-${colorClass}-500 border-${colorClass}-500 text-white`
                          : 'bg-white border-gray-300 text-gray-400'
                      } ${isCurrent ? `ring-4 ring-${colorClass}-200 scale-110` : ''}`}
                    >
                      <Icon className="text-xl" />
                    </div>

                    {/* Content */}
                    <div className={`ml-5 flex-1 pb-4 ${
                      isCurrent ? 'bg-blue-50 -ml-2 pl-7 -mt-2 pt-4 pr-4 rounded-lg border-l-4 border-blue-500' : ''
                    }`}>
                      <p className={`text-base font-bold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-sm mt-1 ${
                        isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                      {step.timestamp && isCompleted && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">
                            📅 {new Date(step.timestamp).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      {isCurrent && !step.timestamp && isCompleted && (
                        <div className="mt-2 inline-block">
                          <span className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full font-bold animate-pulse">
                            ● In Progress
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="mb-6 bg-red-50 border-2 border-red-200">
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
                <FaBox className="text-4xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Order Cancelled</h3>
              <p className="text-red-700">This order has been cancelled</p>
              {tracking.cancelledAt && (
                <p className="text-sm text-red-600 mt-2">
                  Cancelled on: {new Date(tracking.cancelledAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Order Items */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="p-2 bg-purple-100 rounded-lg">
              <FaBox className="text-purple-600" />
            </span>
            Order Items
          </h3>
          <div className="space-y-3">
            {tracking.medicines.map((medicine, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{medicine.medicineName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(medicine.price)} × {medicine.quantity}
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(medicine.total)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-200 pt-4 mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Medicine Total:</span>
              <span className="text-gray-900 font-semibold">{formatCurrency(tracking.medicineTotal)}</span>
            </div>
            {tracking.deliveryType === DELIVERY_TYPES.DELIVERY && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Delivery Charges:</span>
                <span className="text-gray-900 font-semibold">{formatCurrency(tracking.deliveryCharges || 0)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
              <span className="text-lg font-bold text-gray-900">Total Amount</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatCurrency(tracking.totalAmount)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default TrackOrder;
