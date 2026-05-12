// ══════════════════════════════════════════
// slices/cartSlice.js
// ══════════════════════════════════════════
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('cart/add', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/add', payload);
    return data.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
    return data.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/item/${itemId}`);
    return data.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const applyCoupon = createAsyncThunk('cart/applyCoupon', async (code, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/coupon', { code });
    toast.success(data.message);
    return data.data;
  } catch (err) {
    toast.error(err.response?.data?.message || 'Invalid coupon');
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeCoupon = createAsyncThunk('cart/removeCoupon', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.delete('/cart/coupon');
    return data.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const clearCartAsync = createAsyncThunk('cart/clear', async () => {
  await api.delete('/cart');
  return null;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], couponDiscount: 0, couponCode: null, loading: false, error: null },
  reducers: {
    clearCartLocal: (state) => { state.items = []; state.couponDiscount = 0; state.couponCode = null; },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      if (action.payload) {
        state.items = action.payload.items || [];
        state.couponDiscount = action.payload.couponDiscount || 0;
      }
      state.loading = false;
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, (state, action) => { setCart(state, action); toast.success('Added to cart!'); })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, (state, action) => { setCart(state, action); toast.success('Item removed'); })
      .addCase(applyCoupon.fulfilled, (state, action) => { state.couponDiscount = action.payload?.discount || 0; })
      .addCase(removeCoupon.fulfilled, setCart)
      .addCase(clearCartAsync.fulfilled, (state) => { state.items = []; state.couponDiscount = 0; });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export const selectCartCount = (state) => state.cart.items.reduce((s, i) => s + i.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
export default cartSlice.reducer;

// ══════════════════════════════════════════
// slices/productSlice.js
// ══════════════════════════════════════════
import { createSlice as createSliceP, createAsyncThunk as createAsyncThunkP } from '@reduxjs/toolkit';
import apiP from '../../services/api';

export const fetchProducts = createAsyncThunkP('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await apiP.get(`/products?${queryString}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProductBySlug = createAsyncThunkP('products/fetchOne', async (identifier, { rejectWithValue }) => {
  try {
    const { data } = await apiP.get(`/products/${identifier}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFeaturedProducts = createAsyncThunkP('products/fetchFeatured', async (type = 'featured', { rejectWithValue }) => {
  try {
    const { data } = await apiP.get(`/products/featured?type=${type}&limit=12`);
    return { type, products: data.data.products };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const searchProducts = createAsyncThunkP('products/search', async (query, { rejectWithValue }) => {
  try {
    const { data } = await apiP.get(`/products/search?q=${encodeURIComponent(query)}`);
    return data.data.products;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSliceP({
  name: 'products',
  initialState: {
    list: [], pagination: null, currentProduct: null, relatedProducts: [],
    featured: [], newArrivals: [], bestsellers: [],
    searchResults: [], searchLoading: false,
    loading: false, error: null, filters: {},
  },
  reducers: {
    setFilters: (state, action) => { state.filters = action.payload; },
    clearCurrentProduct: (state) => { state.currentProduct = null; state.relatedProducts = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductBySlug.pending, (state) => { state.loading = true; })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.related;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        const { type, products } = action.payload;
        if (type === 'featured') state.featured = products;
        else if (type === 'new') state.newArrivals = products;
        else if (type === 'bestseller') state.bestsellers = products;
      })
      .addCase(searchProducts.pending, (state) => { state.searchLoading = true; })
      .addCase(searchProducts.fulfilled, (state, action) => { state.searchLoading = false; state.searchResults = action.payload; })
      .addCase(searchProducts.rejected, (state) => { state.searchLoading = false; });
  },
});

export const { setFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;

// ══════════════════════════════════════════
// slices/orderSlice.js
// ══════════════════════════════════════════
import { createSlice as createSliceO, createAsyncThunk as createAsyncThunkO } from '@reduxjs/toolkit';
import apiO from '../../services/api';
import toastO from 'react-hot-toast';

export const placeOrder = createAsyncThunkO('orders/place', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await apiO.post('/orders', orderData);
    return data.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to place order'); }
});

export const fetchMyOrders = createAsyncThunkO('orders/fetchMine', async (params = {}, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams(params).toString();
    const { data } = await apiO.get(`/orders/my-orders?${qs}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrderById = createAsyncThunkO('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiO.get(`/orders/${id}`);
    return data.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const cancelOrder = createAsyncThunkO('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await apiO.put(`/orders/${id}/cancel`, { reason });
    return data.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createRazorpayOrder = createAsyncThunkO('orders/createRazorpay', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiO.post('/orders/razorpay/create', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const orderSlice = createSliceO({
  name: 'orders',
  initialState: {
    list: [], pagination: null, currentOrder: null,
    razorpayOrder: null, loading: false, placing: false, error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => { state.currentOrder = null; },
    clearRazorpayOrder: (state) => { state.razorpayOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => { state.placing = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placing = false;
        state.currentOrder = action.payload;
        toastO.success('Order placed successfully!');
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placing = false;
        state.error = action.payload;
        toastO.error(action.payload);
      })
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.currentOrder = action.payload; state.loading = false; })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.list.findIndex(o => o._id === action.payload._id);
        if (idx > -1) state.list[idx] = action.payload;
        state.currentOrder = action.payload;
        toastO.success('Order cancelled');
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => { state.razorpayOrder = action.payload; });
  },
});

export const { clearCurrentOrder, clearRazorpayOrder } = orderSlice.actions;
export default orderSlice.reducer;

// ══════════════════════════════════════════
// slices/uiSlice.js
// ══════════════════════════════════════════
import { createSlice as createSliceU } from '@reduxjs/toolkit';

const uiSlice = createSliceU({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('kpp_theme') === 'dark',
    mobileMenuOpen: false,
    searchOpen: false,
    cartOpen: false,
    language: localStorage.getItem('kpp_lang') || 'en',
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('kpp_theme', state.darkMode ? 'dark' : 'light');
    },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    closeCart: (state) => { state.cartOpen = false; },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('kpp_lang', action.payload);
    },
  },
});

export const { toggleDarkMode, toggleMobileMenu, closeMobileMenu, toggleSearch, toggleCart, closeCart, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;

// ══════════════════════════════════════════
// slices/wishlistSlice.js
// ══════════════════════════════════════════
import { createSlice as createSliceW, createAsyncThunk as createAsyncThunkW } from '@reduxjs/toolkit';
import apiW from '../../services/api';
import toastW from 'react-hot-toast';

export const toggleWishlistItem = createAsyncThunkW('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await apiW.post(`/wishlist/toggle/${productId}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchWishlist = createAsyncThunkW('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiW.get('/wishlist');
    return data.data.items;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const wishlistSlice = createSliceW({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.items = action.payload || []; })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { added, items } = action.payload;
        state.items = items || state.items;
        toastW.success(added ? 'Added to wishlist' : 'Removed from wishlist');
      });
  },
});

export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some(i => (i._id || i) === productId);
export default wishlistSlice.reducer;
