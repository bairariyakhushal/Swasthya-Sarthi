import axiosInstance from './axiosInstance';

export const adminApi = {
  // Get admin dashboard
  getDashboard: async () => {
    const response = await axiosInstance.get('/admin/dashboard');
    return response.data;
  },

  // Get pending pharmacies
  getPendingPharmacies: async () => {
    const response = await axiosInstance.get('/admin/pharmacies/pending');
    return response.data;
  },

  // Get pending volunteers
  getPendingVolunteers: async () => {
    const response = await axiosInstance.get('/admin/volunteers/pending');
    return response.data;
  },

  // Approve/Reject pharmacy
  updatePharmacyApproval: async (pharmacyId, approvalData) => {
    const response = await axiosInstance.put(
      `/admin/pharmacies/${pharmacyId}/approval`,
      approvalData
    );
    return response.data;
  },

  // Approve/Reject volunteer
  updateVolunteerApproval: async (volunteerId, approvalData) => {
    const response = await axiosInstance.put(
      `/admin/volunteers/${volunteerId}/approval`,
      approvalData
    );
    return response.data;
  },

  // Get all pharmacies with filter
  getPharmacies: async (status = 'approved') => {
    const response = await axiosInstance.get(`/admin/pharmacies?status=${status}`);
    return response.data;
  },

  // Get all volunteers
  getVolunteers: async (status = 'approved') => {
    const response = await axiosInstance.get(`/admin/volunteers?status=${status}`);
    return response.data;
  },
};
