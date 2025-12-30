import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendorApi } from '../../api/vendorApi';
import toast from 'react-hot-toast';

// Async thunks
export const registerPharmacy = createAsyncThunk(
  'vendor/registerPharmacy',
  async (pharmacyData, { rejectWithValue }) => {
    try {
      const response = await vendorApi.registerPharmacy(pharmacyData);
      toast.success('Pharmacy registered successfully! Waiting for admin approval.');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getVendorPharmacies = createAsyncThunk(
  'vendor/getVendorPharmacies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getVendorPharmacies();
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getPharmacyDashboard = createAsyncThunk(
  'vendor/getPharmacyDashboard',
  async (pharmacyId, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getPharmacyDashboard(pharmacyId);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getPharmacySales = createAsyncThunk(
  'vendor/getPharmacySales',
  async (pharmacyId, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getPharmacySales(pharmacyId);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getTopMedicines = createAsyncThunk(
  'vendor/getTopMedicines',
  async (pharmacyId, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getTopMedicines(pharmacyId);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const addInventory = createAsyncThunk(
  'vendor/addInventory',
  async ({ pharmacyId, inventoryData }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.addInventory(pharmacyId, inventoryData);
      toast.success(response.message || 'Inventory added successfully!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getPharmacyInventory = createAsyncThunk(
  'vendor/getPharmacyInventory',
  async (pharmacyId, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getPharmacyInventory(pharmacyId);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const markOrderReady = createAsyncThunk(
  'vendor/markOrderReady',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await vendorApi.markOrderReady(orderId);
      toast.success('Order marked as ready for pickup!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const confirmPickup = createAsyncThunk(
  'vendor/confirmPickup',
  async ({ orderId, pickupCode }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.confirmPickup(orderId, pickupCode);
      toast.success('Pickup confirmed!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getPharmacyOrders = createAsyncThunk(
  'vendor/getPharmacyOrders',
  async ({ pharmacyId, status }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.getPharmacyOrders(pharmacyId, status);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateInventory = createAsyncThunk(
  'vendor/updateInventory',
  async ({ pharmacyId, inventoryData }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.updateInventory(pharmacyId, inventoryData);
      toast.success('Inventory updated successfully!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'vendor/updateOrderStatus',
  async ({ orderId, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.updateOrderStatus(orderId, orderStatus);
      toast.success(`Order status updated to ${orderStatus}!`);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const verifyPrescription = createAsyncThunk(
  'vendor/verifyPrescription',
  async ({ orderId, action, reason }, { rejectWithValue }) => {
    try {
      const response = await vendorApi.verifyPrescription(orderId, action, reason);
      toast.success(`Prescription ${action}ed successfully!`);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  pharmacies: [],
  currentPharmacy: null,
  dashboard: null,
  sales: [],
  topMedicines: [],
  inventory: [],
  orders: [],
  loading: false,
  error: null,
};

// Slice
const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setCurrentPharmacy: (state, action) => {
      state.currentPharmacy = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Pharmacy
      .addCase(registerPharmacy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerPharmacy.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerPharmacy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Vendor Pharmacies
      .addCase(getVendorPharmacies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorPharmacies.fulfilled, (state, action) => {
        state.loading = false;
        state.pharmacies = action.payload.data?.pharmacies || action.payload.pharmacies || [];
      })
      .addCase(getVendorPharmacies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Pharmacy Dashboard
      .addCase(getPharmacyDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacyDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data || action.payload;
      })
      .addCase(getPharmacyDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Pharmacy Sales
      .addCase(getPharmacySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacySales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.data?.orders || action.payload.orders || [];
      })
      .addCase(getPharmacySales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Top Medicines
      .addCase(getTopMedicines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.topMedicines = action.payload.data?.topMedicines || action.payload.topMedicines || [];
      })
      .addCase(getTopMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Inventory
      .addCase(addInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInventory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addInventory.rejected, (state, action) => {
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
        state.inventory = action.payload.data?.inventory || action.payload.inventory || [];
      })
      .addCase(getPharmacyInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark Order Ready
      .addCase(markOrderReady.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markOrderReady.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(markOrderReady.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Confirm Pickup
      .addCase(confirmPickup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPickup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmPickup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Pharmacy Orders
      .addCase(getPharmacyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
      })
      .addCase(getPharmacyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Inventory
      .addCase(updateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPrescription.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data || action.payload;
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(verifyPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentPharmacy, clearError } = vendorSlice.actions;
export default vendorSlice.reducer;
