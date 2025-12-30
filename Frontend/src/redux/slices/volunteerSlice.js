import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { volunteerApi } from '../../api/volunteerApi';
import toast from 'react-hot-toast';

// Async thunks
export const getProfile = createAsyncThunk(
  'volunteer/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.getProfile();
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getAvailableOrders = createAsyncThunk(
  'volunteer/getAvailableOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.getAvailableOrders();
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getMyDeliveries = createAsyncThunk(
  'volunteer/getMyDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.getMyDeliveries();
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'volunteer/acceptOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.acceptOrder(orderId);
      toast.success('Order accepted successfully!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'volunteer/updateLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.updateLocation(locationData);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const toggleAvailability = createAsyncThunk(
  'volunteer/toggleAvailability',
  async (availabilityData, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.toggleAvailability(availabilityData);
      toast.success(`You are now ${availabilityData.isAvailable ? 'available' : 'unavailable'}`);
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const markPickupComplete = createAsyncThunk(
  'volunteer/markPickupComplete',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.markPickupComplete(orderId);
      toast.success('Pickup marked as complete!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const markOutForDelivery = createAsyncThunk(
  'volunteer/markOutForDelivery',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.markOutForDelivery(orderId);
      toast.success('Order marked as out for delivery!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const markDeliveryComplete = createAsyncThunk(
  'volunteer/markDeliveryComplete',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await volunteerApi.markDeliveryComplete(orderId);
      toast.success('Delivery marked as complete!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  profile: null,
  availableOrders: [],
  deliveries: [],
  currentLocation: null,
  isAvailable: false,
  loading: false,
  error: null,
};

// Slice
const volunteerSlice = createSlice({
  name: 'volunteer',
  initialState,
  reducers: {
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.volunteer;
        // Sync isAvailable with backend profile data
        state.isAvailable = action.payload.volunteer?.isAvailable ?? false;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Available Orders
      .addCase(getAvailableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.availableOrders = action.payload.orders || [];
      })
      .addCase(getAvailableOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get My Deliveries
      .addCase(getMyDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveries = action.payload.deliveries || [];
      })
      .addCase(getMyDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Location
      .addCase(updateLocation.pending, (state) => {
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload.location;
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Toggle Availability
      .addCase(toggleAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.isAvailable = action.payload.volunteer?.isAvailable || false;
      })
      .addCase(toggleAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Accept Order
      .addCase(acceptOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.loading = false;
        const acceptedOrderId = action.payload.order?._id;
        state.availableOrders = state.availableOrders.filter(order => order.orderId !== acceptedOrderId);
        // Don't update isAvailable status from acceptOrder response
        // Volunteer should remain available after accepting an order
        // isAvailable should only be controlled by toggleAvailability action
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark Pickup Complete
      .addCase(markPickupComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markPickupComplete.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.order;
        const index = state.deliveries.findIndex(d => d._id === updatedOrder._id);
        if (index !== -1) {
          state.deliveries[index] = updatedOrder;
        }
      })
      .addCase(markPickupComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark Out for Delivery
      .addCase(markOutForDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markOutForDelivery.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.order;
        const index = state.deliveries.findIndex(d => d._id === updatedOrder._id);
        if (index !== -1) {
          state.deliveries[index] = updatedOrder;
        }
      })
      .addCase(markOutForDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark Delivery Complete
      .addCase(markDeliveryComplete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markDeliveryComplete.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.order;
        const index = state.deliveries.findIndex(d => d._id === updatedOrder._id);
        if (index !== -1) {
          state.deliveries[index] = updatedOrder;
        }
      })
      .addCase(markDeliveryComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentLocation, clearError } = volunteerSlice.actions;
export default volunteerSlice.reducer;
