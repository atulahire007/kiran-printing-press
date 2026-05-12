import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const toggleWishlistItem = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try { const { data } = await api.post(`/wishlist/toggle/${productId}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/wishlist'); return data.data.items; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.items = action.payload || []; })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { added, items } = action.payload;
        state.items = items || state.items;
        toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
      });
  },
});
export const selectIsWishlisted = (productId) => (state) => state.wishlist.items.some(i => (i._id || i) === productId);
export default wishlistSlice.reducer;
