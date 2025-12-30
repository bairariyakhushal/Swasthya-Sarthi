import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorPharmacies, getPharmacyOrders, markOrderReady, confirmPickup, updateOrderStatus, verifyPrescription } from '../../redux/slices/vendorSlice';
import Layout from '../../components/layouts/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/ui/Modal';
import { FiPackage, FiCheckCircle, FiClock, FiTruck, FiMapPin, FiX, FiFileText } from 'react-icons/fi';
import { ORDER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const VendorOrders = () => {
  const dispatch = useDispatch();
  const { pharmacies, orders, loading } = useSelector((state) => state.vendor);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [pickupModalData, setPickupModalData] = useState({ orderId: '', expectedCode: '' });
  const [statusModalData, setStatusModalData] = useState({ orderId: '', newStatus: '' });
  const [prescriptionModalData, setPrescriptionModalData] = useState({ orderId: '', prescriptionImage: '' });
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [pickupError, setPickupError] = useState('');
  const [prescriptionAction, setPrescriptionAction] = useState('approve');
  const [prescriptionReason, setPrescriptionReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  useEffect(() => {
    dispatch(getVendorPharmacies());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPharmacy) {
      const status = statusFilter === 'all' ? null : statusFilter;
      dispatch(getPharmacyOrders({ pharmacyId: selectedPharmacy, status }));
    }
  }, [selectedPharmacy, statusFilter, dispatch]);

  const handleMarkReady = async (orderId) => {
    const result = await dispatch(markOrderReady(orderId));
    if (!result.error) {
      dispatch(getPharmacyOrders({ pharmacyId: selectedPharmacy, status: statusFilter === 'all' ? null : statusFilter }));
    }
  };

  const handleConfirmPickup = (orderId, displayedPickupCode) => {
    setPickupModalData({ orderId, expectedCode: displayedPickupCode });
    setPickupCodeInput('');
    setPickupError('');
    setShowPickupModal(true);
  };

  const handlePickupSubmit = async () => {
    if (!pickupCodeInput.trim()) {
      setPickupError('Please enter the pickup code');
      return;
    }

    if (pickupCodeInput.trim().toUpperCase() !== pickupModalData.expectedCode.toUpperCase()) {
      setPickupError('Invalid pickup code! Please try again.');
      return;
    }

    const result = await dispatch(confirmPickup({ 
      orderId: pickupModalData.orderId, 
      pickupCode: pickupCodeInput.trim().toUpperCase() 
    }));
    
    if (!result.error) {
      setShowPickupModal(false);
      dispatch(getPharmacyOrders({ pharmacyId: selectedPharmacy, status: statusFilter === 'all' ? null : statusFilter }));
    } else {
      setPickupError('Failed to confirm pickup. Please try again.');
    }
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setStatusModalData({ orderId, newStatus });
    setShowStatusModal(true);
  };
// niyora check
  const handleStatusSubmit = async () => {
    const result = await dispatch(updateOrderStatus({ 
      orderId: statusModalData.orderId, 
      orderStatus: statusModalData.newStatus 
    }));
    
    if (!result.error) {
      setShowStatusModal(false);
      dispatch(getPharmacyOrders({ pharmacyId: selectedPharmacy, status: statusFilter === 'all' ? null : statusFilter }));
    }
  };

  const handleVerifyPrescription = (orderId, prescriptionImage) => {
    setPrescriptionModalData({ orderId, prescriptionImage });
    setPrescriptionAction('approve');
    setPrescriptionReason('');
    setShowPrescriptionModal(true);
  };

  const handlePrescriptionSubmit = async () => {
    if (prescriptionAction === 'reject' && !prescriptionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const result = await dispatch(verifyPrescription({
      orderId: prescriptionModalData.orderId,
      action: prescriptionAction,
      reason: prescriptionReason.trim() || undefined
    }));
    
    if (!result.error) {
      setShowPrescriptionModal(false);
      dispatch(getPharmacyOrders({ pharmacyId: selectedPharmacy, status: statusFilter === 'all' ? null : statusFilter }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock />, label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiCheckCircle />, label: 'Confirmed' },
      ready_for_pickup: { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FiPackage />, label: 'Ready for Pickup' },
      picked_up: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <FiTruck />, label: 'Picked Up' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle />, label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <FiCheckCircle />, label: 'Cancelled' },
      assigned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiTruck />, label: 'Assigned' },
      out_for_delivery: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <FiTruck />, label: 'Out for Delivery' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle />, label: 'Delivered' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: null, label: status };

    return (
      <span className={`flex items-center gap-1 px-3 py-1 ${config.bg} ${config.text} rounded-full text-xs font-medium`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const approvedPharmacies = Array.isArray(pharmacies) 
    ? pharmacies.filter(p => p.approvalStatus === 'approved') 
    : [];

  const filteredOrders = Array.isArray(orders) 
    ? orders.filter(order => {
        if (deliveryTypeFilter === 'all') return true;
        return order.deliveryType === deliveryTypeFilter;
      })
    : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Pharmacy Orders</h1>
          <p className="text-gray-500">Manage and track all your pharmacy orders</p>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 border border-indigo-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Pharmacy
              </label>
              <select
                value={selectedPharmacy}
                onChange={(e) => setSelectedPharmacy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="">-- Select a Pharmacy --</option>
                {approvedPharmacies.map((pharmacy) => (
                  <option key={pharmacy._id} value={pharmacy._id}>
                    {pharmacy.name} - {pharmacy.address}
                  </option>
                ))}
              </select>
              {approvedPharmacies.length === 0 && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                  <FiPackage className="flex-shrink-0" />
                  No approved pharmacies found. Please register and get approval for a pharmacy first.
                </p>
              )}
            </div>

            {selectedPharmacy && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Type
                  </label>
                  <select
                    value={deliveryTypeFilter}
                    onChange={(e) => setDeliveryTypeFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                  >
                    <option value="all">All Types</option>
                    <option value="delivery">Home Delivery</option>
                    <option value="pickup">Store Pickup</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Orders List */}
        {loading ? (
          <Loader />
        ) : !selectedPharmacy ? (
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-indigo-50">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-4xl text-indigo-500" />
              </div>
              <p className="text-gray-600 text-lg font-medium">Please select a pharmacy to view orders</p>
            </div>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-indigo-50">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPackage className="text-4xl text-indigo-500" />
              </div>
              <p className="text-gray-600 text-lg font-medium">No orders found</p>
            </div>
          </Card>
        ) : selectedOrder ? (
          // Detailed Order View
          <div>
            <div className="mb-4">
              <button
                onClick={handleCloseDetails}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
              >
                ← Back to Orders
              </button>
            </div>
            <Card className="hover:shadow-xl transition-all duration-200 border border-indigo-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Order #{selectedOrder._id?.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedOrder.orderPlacedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(selectedOrder.orderStatus)}
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    selectedOrder.deliveryType === 'pickup' 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200'
                  }`}>
                    {selectedOrder.deliveryType === 'pickup' ? '🏪 Store Pickup' : '🚚 Home Delivery'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Details */}
                <div className="lg:col-span-2 space-y-4">

                  {/* Customer Info */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center text-xs">👤</span>
                      Customer Details
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">Name:</span> {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">Contact:</span> {selectedOrder.contactNumber}
                      </p>
                      {selectedOrder.deliveryType === 'pickup' && selectedOrder.pickupCode && (
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">Pickup Code:</span> <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-1 rounded">{selectedOrder.pickupCode}</span>
                        </p>
                      )}
                      {selectedOrder.deliveryType === 'delivery' && selectedOrder.deliveryAddress && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Address:</span> {selectedOrder.deliveryAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Tracking Timeline */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                    <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-200 rounded-lg flex items-center justify-center text-xs">📍</span>
                      Order Tracking
                    </h4>
                    <div className="space-y-3">
                      {/* Order Placed */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xs">✓</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">Order Placed</p>
                          <p className="text-xs text-gray-500">{new Date(selectedOrder.orderPlacedAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Assigned */}
                      {selectedOrder.assignedAt && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Assigned to Volunteer</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.assignedAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      )}

                      {/* Picked Up */}
                      {selectedOrder.pickedUpAt && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Picked Up from Pharmacy</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.pickedUpAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      )}

                      {/* Out for Delivery */}
                      {selectedOrder.outForDeliveryAt && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Out for Delivery</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.outForDeliveryAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      )}

                      {/* Ready for Pickup */}
                      {selectedOrder.readyForPickupAt && selectedOrder.deliveryType === 'pickup' && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Ready for Pickup</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.readyForPickupAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      )}

                      {/* Delivered */}
                      {selectedOrder.deliveredAt && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Delivered</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.deliveredAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      )}

                      {/* Picked Up by Customer */}
                      {selectedOrder.pickedUpByCustomerAt && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">Picked Up by Customer</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.pickedUpByCustomerAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      )}

                      {/* Current Status */}
                      {!selectedOrder.deliveredAt && !selectedOrder.pickedUpByCustomerAt && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs animate-pulse">●</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-800">Current Status: {selectedOrder.orderStatus.replace(/_/g, ' ').toUpperCase()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medicines */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-xs">💊</span>
                      Order Items
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.medicines?.map((med, idx) => (
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
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Medicine Total:</span>
                        <span className="text-gray-900 font-semibold">₹{(selectedOrder.medicineTotal || 0).toFixed(2)}</span>
                      </div>
                      {selectedOrder.deliveryType === 'delivery' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Charges:</span>
                          <span className="text-gray-900 font-semibold">₹{(selectedOrder.deliveryCharges || 0).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg mt-3 p-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-emerald-600">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                    
                    {/* Payment Details */}
                    <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-900">💳 Payment Details</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          selectedOrder.paymentStatus === 'completed' || selectedOrder.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : selectedOrder.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            : 'bg-red-100 text-red-700 border border-red-300'
                        }`}>
                          {selectedOrder.paymentStatus ? selectedOrder.paymentStatus.toUpperCase() : 'PENDING'}
                        </span>
                      </div>
                      {selectedOrder.razorpayPaymentId && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-700">Payment ID:</span>
                            <span className="text-blue-900 font-mono">{selectedOrder.razorpayPaymentId}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-700">Order ID:</span>
                            <span className="text-blue-900 font-mono">{selectedOrder.razorpayOrderId}</span>
                          </div>
                        </div>
                      )}
                      {!selectedOrder.razorpayPaymentId && selectedOrder.deliveryType === 'pickup' && selectedOrder.paymentStatus === 'pending' && (
                        <p className="text-xs text-blue-700 mt-1">💵 Cash on Pickup</p>
                      )}
                    </div>
                  </div>

                  {/* Prescription Info */}
                  {(selectedOrder.needsPrescription || selectedOrder.prescriptionImage) && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center shadow-sm">
                            <FiFileText className="text-amber-700" size={20} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-amber-900 mb-2">
                            {selectedOrder.needsPrescription ? 'Prescription Required' : 'Prescription Uploaded'}
                          </h4>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-amber-700">Status:</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              selectedOrder.prescriptionStatus === 'approved' || selectedOrder.prescriptionStatus === 'accepted' 
                                ? 'bg-green-100 text-green-700 border border-green-300' 
                                : selectedOrder.prescriptionStatus === 'rejected' 
                                ? 'bg-red-100 text-red-700 border border-red-300' 
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {selectedOrder.prescriptionStatus || 'Pending'}
                            </span>
                          </div>
                          {selectedOrder.prescriptionNote && (
                            <p className="text-xs text-amber-800 mt-2 bg-white bg-opacity-60 p-2 rounded-lg italic">
                              "{selectedOrder.prescriptionNote}"
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedOrder.prescriptionImage && (
                        <div className="flex gap-2">
                          <a
                            href={selectedOrder.prescriptionImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm text-center"
                          >
                            View Prescription
                          </a>
                          {selectedOrder.needsPrescription && (selectedOrder.prescriptionStatus === 'pending' || !selectedOrder.prescriptionStatus) && (
                            <button
                              onClick={() => handleVerifyPrescription(selectedOrder._id, selectedOrder.prescriptionImage)}
                              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm"
                            >
                              Verify Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Volunteer Info */}
                  {selectedOrder.volunteer && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
                      <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center text-xs">🚴</span>
                        Assigned Volunteer
                      </h4>
                      <p className="text-sm text-indigo-800">
                        <span className="font-semibold">Name:</span> {selectedOrder.volunteer.firstName} {selectedOrder.volunteer.lastName}
                      </p>
                      <p className="text-sm text-indigo-800 mt-1">
                        <span className="font-semibold">Contact:</span> {selectedOrder.volunteer.contactNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Actions */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 border border-indigo-100 sticky top-4 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center text-xs">⚡</span>
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      {/* Pending Orders */}
                      {selectedOrder.orderStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'confirmed')}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiCheckCircle /> Confirm Order
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiX /> Cancel Order
                          </button>
                        </>
                      )}

                      {/* Confirmed Orders */}
                      {selectedOrder.orderStatus === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'ready_for_pickup')}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiPackage /> Mark Ready
                          </button>
                          {selectedOrder.deliveryType === 'pickup' && (
                            <button
                              onClick={() => handleConfirmPickup(selectedOrder._id, selectedOrder.pickupCode)}
                              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm flex items-center justify-center gap-2"
                              disabled={loading}
                            >
                              <FiCheckCircle /> Complete Pickup
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiX /> Cancel
                          </button>
                        </>
                      )}

                      {/* Ready for Pickup */}
                      {selectedOrder.orderStatus === 'ready_for_pickup' && selectedOrder.deliveryType === 'pickup' && (
                        <>
                          <button
                            onClick={() => handleConfirmPickup(selectedOrder._id, selectedOrder.pickupCode)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiCheckCircle /> Confirm Pickup
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            disabled={loading}
                          >
                            <FiX /> Cancel
                          </button>
                        </>
                      )}

                      {/* Completed/Cancelled Orders */}
                      {(selectedOrder.orderStatus === 'completed' || selectedOrder.orderStatus === 'cancelled' || selectedOrder.orderStatus === 'picked_up') && (
                        <div className="text-center py-6 bg-white rounded-xl border border-gray-200">
                          <span className="text-3xl mb-2 block">✓</span>
                          <p className="text-sm font-medium text-gray-500">No actions available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          // Compact Order List
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order._id?.slice(-8)}
                      </h3>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        👤 {order.customer?.firstName} {order.customer?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.orderPlacedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.deliveryType === 'pickup' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {order.deliveryType === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{order.medicines?.length || 0} item(s)</span>
                        <span className="text-gray-400">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.paymentStatus === 'completed' || order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}> 🏦 : 
                          {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-600 mb-2">
                      ₹{order.totalAmount?.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-sm flex items-center gap-2"
                    >
                      <FiPackage />
                      View Details
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pickup Code Modal */}
      <Modal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        title="Confirm Pickup"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please enter the pickup code provided by the customer to confirm the order pickup.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 mb-1">Expected Code:</p>
            <p className="text-lg font-mono font-bold text-blue-700">
              {pickupModalData.expectedCode}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Pickup Code
            </label>
            <input
              type="text"
              value={pickupCodeInput}
              onChange={(e) => {
                setPickupCodeInput(e.target.value);
                setPickupError('');
              }}
              placeholder="Enter code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono uppercase"
              autoFocus
            />
            {pickupError && (
              <p className="mt-1 text-sm text-red-600">{pickupError}</p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowPickupModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePickupSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Pickup'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Order Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to update the order status to{' '}
            <span className="font-semibold text-gray-900">
              {statusModalData.newStatus?.replace(/_/g, ' ').toUpperCase()}
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
              onClick={handleStatusSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Prescription Verification Modal */}
      <Modal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title="Verify Prescription"
        size="lg"
      >
        <div className="space-y-4">
          {/* Prescription Image */}
          {prescriptionModalData.prescriptionImage && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={prescriptionModalData.prescriptionImage}
                alt="Prescription"
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Verification Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Action
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setPrescriptionAction('approve')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  prescriptionAction === 'approve'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setPrescriptionAction('reject')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  prescriptionAction === 'reject'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✗ Reject
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason {prescriptionAction === 'reject' ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              value={prescriptionReason}
              onChange={(e) => setPrescriptionReason(e.target.value)}
              placeholder={prescriptionAction === 'reject' ? 'Please provide a reason for rejection...' : 'Add any notes about the prescription verification...'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowPrescriptionModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePrescriptionSubmit}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                prescriptionAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Submitting...' : `${prescriptionAction === 'approve' ? 'Approve' : 'Reject'} Prescription`}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default VendorOrders;
