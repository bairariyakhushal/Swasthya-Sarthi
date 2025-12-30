import axiosInstance from './axiosInstance';

export const vendorApi = {
  // Register pharmacy
  registerPharmacy: async (pharmacyData) => {
    const response = await axiosInstance.post('/pharmacy/register', pharmacyData);
    return response.data;
  },

  // Get vendor's pharmacies
  getVendorPharmacies: async () => {
    const response = await axiosInstance.get('/vendor/pharmacies');
    return response.data;
  },

  // Get pharmacy dashboard
  getPharmacyDashboard: async (pharmacyId) => {
    const response = await axiosInstance.get(`/vendor/pharmacy/${pharmacyId}/dashboard`);
    return response.data;
  },

  // Get pharmacy sales
  getPharmacySales: async (pharmacyId) => {
    const response = await axiosInstance.get(`/vendor/pharmacy/${pharmacyId}/sales`);
    return response.data;
  },

  // Get top medicines
  getTopMedicines: async (pharmacyId) => {
    const response = await axiosInstance.get(`/vendor/pharmacy/${pharmacyId}/top-medicines`);
    return response.data;
  },

  // Add inventory
  addInventory: async (pharmacyId, inventoryData) => {
    const response = await axiosInstance.post(
      `/pharmacy/inventory/${pharmacyId}`,
      inventoryData
    );
    return response.data;
  },

  // Get pharmacy inventory
  getPharmacyInventory: async (pharmacyId) => {
    const response = await axiosInstance.get(`/pharmacy/${pharmacyId}/inventory`);
    return response.data;
  },

  // Mark order ready for pickup (FOR delivery ORDER )
  markOrderReady: async (orderId) => {
    const response = await axiosInstance.put(`/pharmacy/order/${orderId}/ready-for-pickup`);
    return response.data;
  },

  // Confirm Customer in store pickup (FOR pickup ORDER)
  confirmPickup: async (orderId, pickupCode) => {
    const response = await axiosInstance.put(`/pharmacy/order/${orderId}/confirm-pickup`, {
      pickupCode
    });
    return response.data;
  },

  // Get all vendor orders (from all pharmacies)
  getAllVendorOrders: async (status = null) => {
    const url = status 
      ? `/order/vendor/orders/${status}`
      : '/order/vendor/orders';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Get pharmacy orders (specific pharmacy)
  getPharmacyOrders: async (pharmacyId, status = null) => {
    const url = status 
      ? `/order/vendor/pharmacy/${pharmacyId}/orders/${status}`
      : `/order/vendor/pharmacy/${pharmacyId}/orders`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Update inventory (use same POST endpoint with stock adjustment)
  updateInventory: async (pharmacyId, inventoryData) => {
    const response = await axiosInstance.post(
      `/pharmacy/inventory/${pharmacyId}`,
      inventoryData
    );
    return response.data;
  },

  // Update order status by vendor
  updateOrderStatus: async (orderId, orderStatus) => {
    const response = await axiosInstance.put(
      `/order/vendor/status/${orderId}`,
      { orderStatus }
    );
    return response.data;
  },

  // Verify prescription
  verifyPrescription: async (orderId, action, reason) => {
    const response = await axiosInstance.put(
      `/order/verify-prescription/${orderId}`,
      { action, reason }
    );
    return response.data;
  },
};
