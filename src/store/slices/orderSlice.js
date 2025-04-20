import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.get('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch all orders, optionally filtered by user
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      let url = '/api/orders';
      if (params && params.user) {
        url += `?user=${params.user}`;
      }
      const { data } = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error fetching orders'
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.token;
      const { data } = await api.put(`/api/orders/${orderId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Refresh orders after update
      dispatch(fetchAllOrders());
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await api.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return orderId;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const deleteAllOrders = createAsyncThunk(
  'orders/deleteAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await api.delete('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create order';
      })
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch orders';
      })
      // Fetch All Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      // Delete single order
      .addCase(deleteOrder.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.orders = state.orders.filter(order => order._id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      // Delete all orders
      .addCase(deleteAllOrders.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteAllOrders.fulfilled, (state) => {
        state.deleteLoading = false;
        state.orders = [];
      })
      .addCase(deleteAllOrders.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  }
});

export const { clearErrors, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer; 