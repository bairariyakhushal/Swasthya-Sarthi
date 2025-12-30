import axiosInstance from './axiosInstance';

export const volunteerApi = {
  // Get volunteer profile
  getProfile: async () => {
    const response = await axiosInstance.get('/volunteer/profile');
    return response.data;
  },

  // Get available orders for delivery
  getAvailableOrders: async () => {
    const response = await axiosInstance.get('/volunteer/available-orders');
    return response.data;
  },

  // Get my deliveries
  getMyDeliveries: async () => {
    const response = await axiosInstance.get('/volunteer/my-deliveries');
    return response.data;
  },

  // Update location
  updateLocation: async (locationData) => {
    const response = await axiosInstance.put('/volunteer/location', locationData);
    return response.data;
  },

  // Toggle availability
  toggleAvailability: async (availabilityData) => {
    const response = await axiosInstance.put('/volunteer/availability', availabilityData);
    return response.data;
  },

  // Accept delivery order
  acceptOrder: async (orderId) => {
    const response = await axiosInstance.put(`/volunteer/accept-order/${orderId}`);
    return response.data;
  },

  // Mark pickup complete (picked up from pharmacy)
  markPickupComplete: async (orderId) => {
    const response = await axiosInstance.put(`/volunteer/pickup-complete/${orderId}`);
    return response.data;
  },

  // Mark out for delivery (on the way to customer)
  markOutForDelivery: async (orderId) => {
    const response = await axiosInstance.put(`/volunteer/out-for-delivery/${orderId}`);
    return response.data;
  },

  // Mark delivery complete (delivered to customer)
  markDeliveryComplete: async (orderId) => {
    const response = await axiosInstance.put(`/volunteer/delivery-complete/${orderId}`);
    return response.data;
  },
};
