import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const placeOrder = createAsyncThunk('orders/place', async (orderData, { rejectWithValue }) => {
  try { const { data } = await api.post('/orders', orderData); return data.data.order; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to place order'); }
});
export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (params = {}, { rejectWithValue }) => {
  try { const qs = new URLSearchParams(params).toString(); const { data } = await api.get(`/orders/my-orders?${qs}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchOrderById = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/orders/${id}`); return data.data.order; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/orders/${id}/cancel`, { reason }); return data.data.order; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const createRazorpayOrder = createAsyncThunk('orders/createRazorpay', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/orders/razorpay/create', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { list: [], pagination: null, currentOrder: null, razorpayOrder: null, loading: false, placing: false, error: null },
  reducers: {
    clearCurrentOrder: (state) => { state.currentOrder = null; },
    clearRazorpayOrder: (state) => { state.razorpayOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (s) => { s.placing = true; s.error = null; })
      .addCase(placeOrder.fulfilled, (state, action) => { state.placing = false; state.currentOrder = action.payload; toast.success('Order placed successfully!'); })
      .addCase(placeOrder.rejected, (state, action) => { state.placing = false; state.error = action.payload; toast.error(action.payload); })
      .addCase(fetchMyOrders.pending, (s) => { s.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.orders; state.pagination = action.payload.pagination; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.list.findIndex(o => o._id === action.payload._id);
        if (idx > -1) state.list[idx] = action.payload;
        state.currentOrder = action.payload;
        toast.success('Order cancelled');
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => { state.razorpayOrder = action.payload; });
  },
});
export const { clearCurrentOrder, clearRazorpayOrder } = orderSlice.actions;
export default orderSlice.reducer;
