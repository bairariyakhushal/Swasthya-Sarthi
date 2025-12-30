import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';

// Async thunks
export const getDashboard = createAsyncThunk(
  'admin/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getDashboard();
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getPendingPharmacies = createAsyncThunk(
  'admin/getPendingPharmacies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingPharmacies();
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getPendingVolunteers = createAsyncThunk(
  'admin/getPendingVolunteers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPendingVolunteers();
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updatePharmacyApproval = createAsyncThunk(
  'admin/updatePharmacyApproval',
  async ({ pharmacyId, approvalData }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updatePharmacyApproval(pharmacyId, approvalData);
      toast.success(response.message || `Pharmacy ${approvalData.status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateVolunteerApproval = createAsyncThunk(
  'admin/updateVolunteerApproval',
  async ({ volunteerId, approvalData }, { rejectWithValue }) => {
    try {
      const response = await adminApi.updateVolunteerApproval(volunteerId, approvalData);
      toast.success(response.message || `Volunteer ${approvalData.status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getPharmacies = createAsyncThunk(
  'admin/getPharmacies',
  async (status, { rejectWithValue }) => {
    try {
      const response = await adminApi.getPharmacies(status);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getVolunteers = createAsyncThunk(
  'admin/getVolunteers',
  async (status, { rejectWithValue }) => {
    try {
      const response = await adminApi.getVolunteers(status);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  dashboard: null,
  pendingPharmacies: [],
  pendingVolunteers: [],
  pharmacies: [],
  volunteers: [],
  loading: false,
  error: null,
};

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Dashboard
      .addCase(getDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.dashboard;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Pending Pharmacies
      .addCase(getPendingPharmacies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingPharmacies.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingPharmacies = action.payload.pharmacies || [];
      })
      .addCase(getPendingPharmacies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Pending Volunteers
      .addCase(getPendingVolunteers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingVolunteers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingVolunteers = action.payload.volunteers || [];
      })
      .addCase(getPendingVolunteers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Pharmacy Approval
      .addCase(updatePharmacyApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePharmacyApproval.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePharmacyApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Volunteer Approval
      .addCase(updateVolunteerApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVolunteerApproval.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateVolunteerApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Pharmacies
      .addCase(getPharmacies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacies.fulfilled, (state, action) => {
        state.loading = false;
        state.pharmacies = action.payload.pharmacies || [];
      })
      .addCase(getPharmacies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Volunteers
      .addCase(getVolunteers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVolunteers.fulfilled, (state, action) => {
        state.loading = false;
        state.volunteers = action.payload.volunteers || [];
      })
      .addCase(getVolunteers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
