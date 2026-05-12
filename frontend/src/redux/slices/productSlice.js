import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try { const qs = new URLSearchParams(params).toString(); const { data } = await api.get(`/products?${qs}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchProductBySlug = createAsyncThunk('products/fetchOne', async (identifier, { rejectWithValue }) => {
  try { const { data } = await api.get(`/products/${identifier}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (type = 'featured', { rejectWithValue }) => {
  try { const { data } = await api.get(`/products/featured?type=${type}&limit=12`); return { type, products: data.data.products }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const searchProducts = createAsyncThunk('products/search', async (query, { rejectWithValue }) => {
  try { const { data } = await api.get(`/products/search?q=${encodeURIComponent(query)}`); return data.data.products; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/categories'); return data.data.categories; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    list: [], pagination: null, currentProduct: null, relatedProducts: [],
    featured: [], newArrivals: [], bestsellers: [], categories: [],
    searchResults: [], searchLoading: false, loading: false, error: null, filters: {},
  },
  reducers: {
    setFilters: (state, action) => { state.filters = action.payload; },
    clearCurrentProduct: (state) => { state.currentProduct = null; state.relatedProducts = []; },
    clearSearchResults: (state) => { state.searchResults = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.products; state.pagination = action.payload.pagination; })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductBySlug.pending, (s) => { s.loading = true; })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload.product; state.relatedProducts = action.payload.related; })
      .addCase(fetchProductBySlug.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        const { type, products } = action.payload;
        if (type === 'featured') state.featured = products;
        else if (type === 'new') state.newArrivals = products;
        else if (type === 'bestseller') state.bestsellers = products;
      })
      .addCase(searchProducts.pending, (s) => { s.searchLoading = true; })
      .addCase(searchProducts.fulfilled, (state, action) => { state.searchLoading = false; state.searchResults = action.payload; })
      .addCase(searchProducts.rejected, (s) => { s.searchLoading = false; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; });
  },
});
export const { setFilters, clearCurrentProduct, clearSearchResults } = productSlice.actions;
export default productSlice.reducer;
