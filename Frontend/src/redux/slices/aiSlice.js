import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiApi } from '../../api/aiApi';
import toast from 'react-hot-toast';

// Async thunks
export const getMedicineInfo = createAsyncThunk(
  'ai/getMedicineInfo',
  async (medicineName, { rejectWithValue }) => {
    try {
      const response = await aiApi.getMedicineInfo(medicineName);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getSymptomSuggestion = createAsyncThunk(
  'ai/getSymptomSuggestion',
  async (symptoms, { rejectWithValue }) => {
    try {
      const response = await aiApi.getSymptomSuggestion(symptoms);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  medicineInfo: null,
  symptomSuggestion: null,
  loading: false,
  error: null,
};

// Slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearMedicineInfo: (state) => {
      state.medicineInfo = null;
    },
    clearSymptomSuggestion: (state) => {
      state.symptomSuggestion = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Medicine Info
      .addCase(getMedicineInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicineInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.medicineInfo = action.payload.data;
      })
      .addCase(getMedicineInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Symptom Suggestion
      .addCase(getSymptomSuggestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSymptomSuggestion.fulfilled, (state, action) => {
        state.loading = false;
        state.symptomSuggestion = action.payload.data;
      })
      .addCase(getSymptomSuggestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMedicineInfo, clearSymptomSuggestion, clearError } = aiSlice.actions;
export default aiSlice.reducer;
