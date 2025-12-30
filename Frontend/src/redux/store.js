import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import vendorReducer from './slices/vendorSlice';
import volunteerReducer from './slices/volunteerSlice';
import adminReducer from './slices/adminSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    vendor: vendorReducer,
    volunteer: volunteerReducer,
    admin: adminReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
