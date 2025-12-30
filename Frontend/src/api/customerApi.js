import axiosInstance from './axiosInstance';

export const customerApi = {
  // Search medicines with location
searchMedicines: async (params) => {
  const { latitude, longitude, radius = 3, medicineName } = params;

  const response = await axiosInstance.post(
    '/pharmacy/search',
    {
      latitude,
      longitude,
      radius,
      medicineName
    }
  );
 console.log("D:\FINAL_YEAR_PROJ_FRONTEND\FRONTEND\src\api\customerApi.js== ",response.data)
  return response.data;
},


  // Get pharmacy inventory
  getPharmacyInventory: async (pharmacyId) => {
    const response = await axiosInstance.get(`/pharmacy/${pharmacyId}/inventory`);
    return response.data;
  },

  // Create payment order (Razorpay)
  createPaymentOrder: async (orderData) => {
    const formData = new FormData();
    
    // Add required fields
    formData.append('pharmacyId', orderData.pharmacy);
    formData.append('medicines', JSON.stringify(orderData.medicines));
    formData.append('deliveryType', orderData.deliveryType);
    formData.append('contactNumber', orderData.contactNumber);
    formData.append('deliveryCoordinates', JSON.stringify(orderData.deliveryCoordinates));
    
    // Add optional fields
    if (orderData.deliveryAddress) {
      formData.append('deliveryAddress', orderData.deliveryAddress);
    }
    if (orderData.prescriptionImage) {
      formData.append('prescriptionImage', orderData.prescriptionImage);
    }
    
    const response = await axiosInstance.post('/order/create-payment-order', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // Increase timeout to 30 seconds for order creation with file upload
    });
    return response.data;
  },

  // Get my orders
  getMyOrders: async (status = 'all') => {
    const endpoint = status === 'all' 
      ? '/order/my-orders' 
      : `/order/my-orders/${status}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/order/${orderId}`);
    return response.data;
  },

  // Track order
  trackOrder: async (orderId) => {
    const response = await axiosInstance.get(`/order/track/${orderId}`);
    return response.data;
  },



  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post(
      '/order/verify-payment',
      paymentData
    );
    return response.data;
  },

  // Get nearest pharmacies
  getNearestPharmacies: async (params) => {
    const { latitude, longitude, radius = 10 } = params;
    
    const response = await axiosInstance.post(
      '/pharmacy/nearest',
      {
        latitude,
        longitude,
        radius
      }
    );
    return response.data;
  },
};
