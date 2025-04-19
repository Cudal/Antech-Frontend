import api from '../../utils/api';
import {
  FETCH_ALL_ORDERS_REQUEST,
  FETCH_ALL_ORDERS_SUCCESS,
  FETCH_ALL_ORDERS_FAIL,
  UPDATE_ORDER_STATUS_REQUEST,
  UPDATE_ORDER_STATUS_SUCCESS,
  UPDATE_ORDER_STATUS_FAIL,
} from '../constants/orderConstants';

// Fetch all orders (admin)
export const fetchAllOrders = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ALL_ORDERS_REQUEST });

    const { data } = await api.get('/api/orders');

    dispatch({
      type: FETCH_ALL_ORDERS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_ALL_ORDERS_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

// Update order status (admin)
export const updateOrderStatus = (orderId, status) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_ORDER_STATUS_REQUEST });

    const { data } = await api.put(`/api/orders/${orderId}/status`, { status });

    dispatch({
      type: UPDATE_ORDER_STATUS_SUCCESS,
      payload: data,
    });

    // Refresh the orders list
    dispatch(fetchAllOrders());
  } catch (error) {
    dispatch({
      type: UPDATE_ORDER_STATUS_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
}; 