import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi } from '../../api/customerApi';
import toast from 'react-hot-toast';

// Async thunks
export const searchMedicines = createAsyncThunk(
  'customer/searchMedicines',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await customerApi.searchMedicines(searchParams);
      console.log(searchParams);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getPharmacyInventory = createAsyncThunk(
  'customer/getPharmacyInventory',
  async (pharmacyId, { rejectWithValue }) => {
    try {
      const response = await customerApi.getPharmacyInventory(pharmacyId);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const createPaymentOrder = createAsyncThunk(
  'customer/createPaymentOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await customerApi.createPaymentOrder(orderData);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getMyOrders = createAsyncThunk(
  'customer/getMyOrders',
  async (status = 'all', { rejectWithValue }) => {
    try {
      const response = await customerApi.getMyOrders(status);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const trackOrder = createAsyncThunk(
  'customer/trackOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await customerApi.trackOrder(orderId);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

// export const uploadPrescription = createAsyncThunk(
//   'customer/uploadPrescription',
//   async ({ orderId, file }, { rejectWithValue }) => {
//     try {
//       const response = await customerApi.uploadPrescription(orderId, file);
//       toast.success('Prescription uploaded successfully!');
//       return response;
//     } catch (error) {
//       toast.error(error.message);
//       return rejectWithValue(error.message);
//     }
//   }
// );

export const verifyPayment = createAsyncThunk(
  'customer/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await customerApi.verifyPayment(paymentData);
      return response;
    } catch (error) {
      toast.error(error.message || 'Payment verification failed');
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  searchResults: [],
  searchMetadata: null,
  pharmacyInventory: null,
  orders: [],
  currentOrder: null,
  trackingData: null,
  userLocation: null,
  loading: false,
  error: null,
};

// Slice
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Medicines
      .addCase(searchMedicines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.pharmacies || [];
        state.searchMetadata = {
          searchType: action.payload.searchType,
          totalResults: action.payload.totalResults,
          message: action.payload.message,
        };
      })
      .addCase(searchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Pharmacy Inventory
      .addCase(getPharmacyInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacyInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.pharmacyInventory = action.payload.data;
      })
      .addCase(getPharmacyInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Payment Order
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get My Orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Track Order
      .addCase(trackOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.trackingData = action.payload.tracking;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // // Upload Prescription
      // .addCase(uploadPrescription.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(uploadPrescription.fulfilled, (state) => {
      //   state.loading = false;
      // })
      // .addCase(uploadPrescription.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUserLocation, clearSearchResults, clearError } = customerSlice.actions;
export default customerSlice.reducer;
