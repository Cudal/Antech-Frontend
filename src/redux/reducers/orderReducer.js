import {
  FETCH_ALL_ORDERS_REQUEST,
  FETCH_ALL_ORDERS_SUCCESS,
  FETCH_ALL_ORDERS_FAIL,
  UPDATE_ORDER_STATUS_REQUEST,
  UPDATE_ORDER_STATUS_SUCCESS,
  UPDATE_ORDER_STATUS_FAIL,
} from '../constants/orderConstants';

const initialState = {
  orders: [],
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
};

export const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALL_ORDERS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_ALL_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: action.payload,
        error: null,
      };
    case FETCH_ALL_ORDERS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case UPDATE_ORDER_STATUS_REQUEST:
      return {
        ...state,
        updateLoading: true,
      };
    case UPDATE_ORDER_STATUS_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        updateError: null,
      };
    case UPDATE_ORDER_STATUS_FAIL:
      return {
        ...state,
        updateLoading: false,
        updateError: action.payload,
      };
    default:
      return state;
  }
}; 