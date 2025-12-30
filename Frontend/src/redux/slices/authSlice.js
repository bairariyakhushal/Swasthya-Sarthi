import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

// Async thunks
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.sendOTP(email);
      toast.success('OTP sent successfully!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(userData);
      toast.success(response.message || 'Signup successful! Please login.');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      
      console.log('🔐 Login response received:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        userType: response.user?.accountType,
        tokenPreview: response.token ? response.token.substring(0, 30) + '...' : 'none'
      });
      
      // Store token and user data
      if (response.token) {
        localStorage.setItem('token', response.token);
        // Also set token as cookie for backend authentication
        document.cookie = `token=${response.token}; path=/; SameSite=Lax; max-age=86400`;
        console.log('✅ Token stored in localStorage and cookie');
      } else {
        console.error('❌ No token in response!');
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('✅ User stored in localStorage');
      } else {
        console.error('❌ No user in response!');
      }
      
      toast.success(response.message || 'Login successful!');
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData);
      toast.success('Password changed successfully!');
      return response;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      // Sync Redux state with localStorage on app initialization
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('🔄 Initializing auth state');
      console.log('   Token in localStorage:', !!token);
      console.log('   User in localStorage:', !!user);
      
      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          state.token = token;
          state.user = parsedUser;
          state.isAuthenticated = true;
          // Set cookie if token exists in localStorage
          document.cookie = `token=${token}; path=/; SameSite=Lax; max-age=86400`;
          console.log('✅ Auth initialized - User:', parsedUser.accountType);
        } catch (error) {
          // If parsing fails, clear everything
          console.error('❌ Failed to parse user data:', error);
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        // Clear state if no valid token/user
        console.log('⚠️ No valid token/user found');
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
    logout: (state, action) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Clear token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
      // Only show toast if it's a manual logout (not from axios interceptor)
      if (action.payload?.showToast !== false) {
        toast.success('Logged out successfully');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { initializeAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
