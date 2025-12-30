import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDeliveries } from '../../redux/slices/volunteerSlice';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import { FiPackage, FiMapPin, FiPhone, FiClock, FiCheckCircle, FiTruck, FiArrowLeft } from 'react-icons/fi';

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { deliveries, loading } = useSelector((state) => state.volunteer);

  useEffect(() => {
    dispatch(getMyDeliveries());
  }, [dispatch]);

  const order = deliveries.find(d => d._id === orderId);

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

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { status: 'assigned', label: 'Assigned', icon: <FiClock /> },
      { status: 'picked_up', label: 'Picked Up', icon: <FiPackage /> },
      { status: 'out_for_delivery', label: 'Out for Delivery', icon: <FiTruck /> },
      { status: 'delivered', label: 'Delivered', icon: <FiCheckCircle /> },
    ];

    const statusOrder = ['assigned', 'picked_up', 'out_for_delivery', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex,
      isCurrent: statusOrder[index] === currentStatus,
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Loader />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border border-gray-200">
            <div className="text-center py-16">
              <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-4">Order not found</p>
              <Button onClick={() => navigate('/volunteer/deliveries')}>
                Back to Deliveries
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const statusSteps = getStatusSteps(order.orderStatus);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/volunteer/deliveries')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <FiArrowLeft /> Back to Deliveries
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Delivery Details
          </h1>
          <p className="text-gray-500">Order #{order._id?.slice(-8)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Delivery Status & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <Card className="border border-indigo-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Delivery Status</h3>
              <div className="relative">
                {statusSteps.map((step, index) => (
                  <div key={step.status} className="relative pb-8 last:pb-0">
                    <div className="flex items-start">
                      {/* Timeline Line */}
                      {index < statusSteps.length - 1 && (
                        <div 
                          className={`absolute left-5 top-12 h-full w-0.5 ${
                            step.isCompleted ? 'bg-indigo-500' : 'bg-gray-300'
                          }`} 
                        />
                      )}
                      
                      {/* Icon */}
                      <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        step.isCompleted 
                          ? 'bg-indigo-500 border-indigo-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {step.icon}
                      </div>

                      {/* Content */}
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold ${
                            step.isCurrent ? 'text-indigo-600' : step.isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                          {step.isCurrent && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        {step.isCompleted && (
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date().toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pickup Location */}
            <Card className="border border-indigo-100">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-200 rounded-lg flex items-center justify-center">🏪</span>
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
                    <a 
                      href={`tel:${order.pharmacy.contactNumber}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium"
                    >
                      <FiPhone />
                      {order.pharmacy.contactNumber}
                    </a>
                  )}
                </div>
              </div>
            </Card>

            {/* Delivery Location */}
            <Card className="border border-emerald-100">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">📍</span>
                  Delivery Location
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Customer:</span> {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                  <a 
                    href={`tel:${order.contactNumber}`}
                    className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-2 font-medium"
                  >
                    <FiPhone />
                    {order.contactNumber}
                  </a>
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <FiMapPin className="mt-1 flex-shrink-0 text-emerald-600" />
                    <span>{order.deliveryAddress}</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Order Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card className="border border-gray-200">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Status</h4>
                  {getStatusBadge(order.orderStatus)}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Date</h4>
                  <p className="text-sm text-gray-700">
                    {new Date(order.orderPlacedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Status</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    order.paymentStatus === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.paymentStatus?.toUpperCase()}
                  </span>
                </div>

                {order.distance && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Distance</h4>
                    <p className="text-sm text-gray-700">{order.distance} km</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Items */}
            <Card className="border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-2">
                {order.medicines?.map((med, idx) => (
                  <div key={idx} className="flex justify-between items-start text-sm pb-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{med.medicineName}</p>
                      <p className="text-xs text-gray-500">Qty: {med.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900">
                      ₹{(med.price * med.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mt-4 p-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-blue-600">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryTracking;
