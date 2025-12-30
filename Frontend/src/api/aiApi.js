import axiosInstance from './axiosInstance';

export const aiApi = {
  // Get medicine information
  getMedicineInfo: async (medicineName) => {
    const response = await axiosInstance.post('/ai/medicine-info', {
      medicineName,
    });
    return response.data;
  },

  // Get medicine suggestions based on symptoms
  getSymptomSuggestion: async (symptoms) => {
    const response = await axiosInstance.post('/ai/symptom-suggestion', {
      symptoms,
    });
    return response.data;
  },
};
