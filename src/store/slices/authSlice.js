import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/api';

// Helper function to check if token exists
const hasValidToken = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with credentials:', credentials.username);
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      console.log('Login successful, token received:', response.data.token ? 'exists' : 'missing');
      localStorage.setItem('token', response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, signal }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        signal
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        return rejectWithValue(error.response?.data || { message: 'Registration failed' });
      }
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, signal }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });
      return response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        localStorage.removeItem('token');
        return rejectWithValue(error.response?.data || { message: 'Authentication failed' });
      }
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: hasValidToken(),
  loading: hasValidToken(),
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('[DEBUG] Login fulfilled - payload:', {
          hasToken: !!action.payload?.token,
          hasUser: !!action.payload?.user,
          userRole: action.payload?.user?.role
        });
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        console.log('[DEBUG] Redux auth state updated:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user
        });
      })
      .addCase(login.rejected, (state, action) => {
        console.error('[DEBUG] Login rejected - error:', action.payload);
        state.error = action.payload?.message || 'Login failed';
        state.loading = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || 'Authentication failed';
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;