import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingCart, FaMapMarkerAlt, FaStore } from 'react-icons/fa';
import Layout from '../../components/layouts/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { createPaymentOrder, verifyPayment } from '../../redux/slices/customerSlice';
import { formatCurrency } from '../../utils/formatters';
import { DELIVERY_TYPES } from '../../utils/constants';
import { getCurrentLocation } from '../../utils/location';
import toast from 'react-hot-toast';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.customer);
  const { user } = useSelector(state => state.auth);

  const { ordersByPharmacy } = location.state || {};

  const [deliveryType, setDeliveryType] = useState(DELIVERY_TYPES.DELIVERY);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [needsPrescription, setNeedsPrescription] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cash'

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Get user location on mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError(error.message);
        toast.error(error.message);
        // Set default location if geolocation fails
        setUserLocation({
          latitude: 0,
          longitude: 0,
        });
      }
    };

    fetchLocation();
  }, []);

  if (!ordersByPharmacy) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <p className="text-center text-gray-500 py-8">No items in cart. Please add medicines first.</p>
            <div className="text-center">
              <Button onClick={() => navigate('/customer/search')}>Search Medicines</Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!userLocation) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Getting your location...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const orders = Object.values(ordersByPharmacy);

  const calculateOrderTotal = (order) => {
    return order.medicines.reduce((sum, med) => sum + med.total, 0);
  };

  const calculateGrandTotal = () => {
    return orders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
  };

  const handlePrescriptionChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
    }
  };
// Nilesh check
  const handlePlaceOrder = async () => {
    if (deliveryType === DELIVERY_TYPES.DELIVERY && !deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    setIsProcessing(true);

    try {
      // Fetch fresh location before placing order
      let currentLocation = userLocation;
      try {
        const freshLocation = await getCurrentLocation();
        currentLocation = freshLocation;
        setUserLocation(freshLocation);
      } catch (error) {
        console.warn('Could not get fresh location, using existing:', error);
        toast.error('Using previously saved location');
      }

      // Create order for each pharmacy
      for (const order of orders) {
        const orderData = {
          pharmacy: order.pharmacy._id,
          medicines: order.medicines.map(med => ({
            medicineName: med.medicineName,
            quantity: med.quantity,
            price: med.price,
            total: med.total,
          })),
          deliveryType,
          contactNumber: user?.contactNumber || '9876543210',
          deliveryCoordinates: currentLocation || { latitude: 0, longitude: 0 },
        };

        // Add delivery address for delivery type
        if (deliveryType === DELIVERY_TYPES.DELIVERY) {
          orderData.deliveryAddress = deliveryAddress;
        }

        // Add prescription file if provided
        if (needsPrescription && prescriptionFile) {
          orderData.prescriptionImage = prescriptionFile;
        }

        const result = await dispatch(createPaymentOrder(orderData)).unwrap();
        
        // If cash payment for pickup, skip Razorpay and redirect
        if (deliveryType === DELIVERY_TYPES.PICKUP && paymentMethod === 'cash') {
          toast.success('Order placed successfully! Pay at pharmacy counter.');
          navigate('/customer/orders');
          return;
        }
        
        // Initialize Razorpay payment for online payment
        const options = {
          key: result.key,
          amount: result.amount * 100, // Amount in paise
          currency: 'INR',
          name: 'Swasthya Sarathi',
          description: `Order from ${result.pharmacyName}`,
          order_id: result.razorpayOrderId,
          handler: async function (response) {
            try {
              // Verify payment with backend
              const paymentData = {
                orderId: result.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              };
              
              console.log('🔐 Payment Verification Data:', paymentData);
              
              await dispatch(verifyPayment(paymentData)).unwrap();
              
              toast.success('Payment successful!');
              
              // // Upload prescription after successful payment if needed
              // if (result.needsPrescription && prescriptionFile && result.prescriptionStatus === 'pending_verification') {
              //   try {
              //     await dispatch(uploadPrescription({
              //       orderId: result.orderId,
              //       file: prescriptionFile,
              //     })).unwrap();
              //     toast.success('Prescription uploaded successfully');
              //   } catch (error) {
              //     toast.error('Failed to upload prescription');
              //   }
              // }
              
              // Redirect to orders page
              navigate('/customer/orders');
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
              console.error('Payment verification error:', error);
            }
          },
          prefill: {
            name: user?.firstName + ' ' + user?.lastName || '',
            email: user?.email || '',
            contact: user?.contactNumber || '',
          },
          theme: {
            color: '#3B82F6',
          },
          modal: {
            ondismiss: function() {
              toast.error('Payment cancelled');
              setIsProcessing(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      toast.error(error.message || 'Failed to create order');
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Type Selection */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deliveryType"
                    value={DELIVERY_TYPES.DELIVERY}
                    checked={deliveryType === DELIVERY_TYPES.DELIVERY}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="mr-3"
                  />
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  <div>
                    <p className="font-medium">Home Delivery</p>
                    <p className="text-sm text-gray-500">Get medicines delivered to your doorstep</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deliveryType"
                    value={DELIVERY_TYPES.PICKUP}
                    checked={deliveryType === DELIVERY_TYPES.PICKUP}
                    onChange={(e) => {
                      setDeliveryType(e.target.value);
                      setPaymentMethod('online'); // Reset to online when changing delivery type
                    }}
                    className="mr-3"
                  />
                  <FaStore className="mr-2 text-green-600" />
                  <div>
                    <p className="font-medium">Store Pickup</p>
                    <p className="text-sm text-gray-500">Pick up from pharmacy counter</p>
                  </div>
                </label>
              </div>

              {deliveryType === DELIVERY_TYPES.DELIVERY && (
                <div className="mt-4">
                  <Input
                    label="Delivery Address"
                    placeholder="Enter complete delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    rows={3}
                    multiline
                  />
                </div>
              )}
            </Card>

            {/* Payment Method (for pickup orders) */}
            {deliveryType === DELIVERY_TYPES.PICKUP && (
              <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Pay Online</p>
                      <p className="text-sm text-gray-500">Pay now using UPI, Card, or Net Banking</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium">Cash on Pickup</p>
                      <p className="text-sm text-gray-500">Pay at the pharmacy counter when you collect</p>
                    </div>
                  </label>
                </div>
              </Card>
            )}

            {/* Prescription Upload */}
            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Prescription</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={needsPrescription}
                    onChange={(e) => setNeedsPrescription(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">This order requires prescription</span>
                </label>

                {needsPrescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Prescription
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePrescriptionChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {prescriptionFile && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {prescriptionFile.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Accepted formats: JPG, PNG, PDF
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Items */}
            {orders.map((order, idx) => (
              <Card key={idx}>
                <div className="mb-4 border-b pb-3">
                  <h3 className="text-lg font-bold text-gray-800">{order.pharmacy.name}</h3>
                  <p className="text-sm text-gray-600">{order.pharmacy.address}</p>
                  {deliveryType === DELIVERY_TYPES.PICKUP && (
                    <p className="text-sm text-blue-600 mt-1">
                      📍 Pickup from this location
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {order.medicines.map((medicine, medIdx) => (
                    <div
                      key={medIdx}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{medicine.medicineName}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(medicine.price)} × {medicine.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(medicine.total)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Order Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(calculateOrderTotal(order))}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card className="sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Pharmacies:</span>
                  <span className="font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">
                    {orders.reduce((sum, order) => 
                      sum + order.medicines.reduce((s, m) => s + m.quantity, 0), 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Type:</span>
                  <span className="font-medium">
                    {deliveryType === DELIVERY_TYPES.DELIVERY ? 'Home Delivery' : 'Store Pickup'}
                  </span>
                </div>
                {deliveryType === DELIVERY_TYPES.PICKUP && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium">
                      {paymentMethod === 'online' ? 'Pay Online' : 'Cash on Pickup'}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Grand Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculateGrandTotal())}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={loading || isProcessing}
                className="w-full flex items-center justify-center gap-2"
              >
                <FaShoppingCart />
                {isProcessing 
                  ? 'Processing...' 
                  : deliveryType === DELIVERY_TYPES.PICKUP && paymentMethod === 'cash'
                    ? 'Place Order (Pay on Pickup)'
                    : 'Place Order & Pay Online'
                }
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
