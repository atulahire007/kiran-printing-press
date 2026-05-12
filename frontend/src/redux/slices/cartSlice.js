import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/cart'); return data.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const addToCart = createAsyncThunk('cart/add', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/cart/add', payload); return data.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/cart/item/${itemId}`, { quantity }); return data.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { const { data } = await api.delete(`/cart/item/${itemId}`); return data.data.cart; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const applyCoupon = createAsyncThunk('cart/applyCoupon', async (code, { rejectWithValue }) => {
  try { const { data } = await api.post('/cart/coupon', { code }); toast.success(data.message); return data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); return rejectWithValue(err.response?.data?.message); }
});
export const removeCoupon = createAsyncThunk('cart/removeCoupon', async () => {
  const { data } = await api.delete('/cart/coupon'); return data.data.cart;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], couponDiscount: 0, couponCode: null, loading: false, error: null },
  reducers: { clearCartLocal: (state) => { state.items = []; state.couponDiscount = 0; } },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      if (action.payload) { state.items = action.payload.items || []; state.couponDiscount = action.payload.couponDiscount || 0; }
      state.loading = false;
    };
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, (state, action) => { setCart(state, action); toast.success('Added to cart!'); })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, (state, action) => { setCart(state, action); toast.success('Item removed'); })
      .addCase(applyCoupon.fulfilled, (state, action) => { state.couponDiscount = action.payload?.discount || 0; })
      .addCase(removeCoupon.fulfilled, setCart);
  },
});

export const { clearCartLocal } = cartSlice.actions;
export const selectCartCount = (state) => state.cart.items.reduce((s, i) => s + i.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
export default cartSlice.reducer;
