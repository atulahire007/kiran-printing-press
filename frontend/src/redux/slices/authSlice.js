import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Thunks ──────────────────────────────────
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  } catch (err) {
    localStorage.removeItem('token');
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.get('/auth/logout').catch(() => {});
  localStorage.removeItem('token');
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/me', profileData);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const googleLogin = createAsyncThunk('auth/google', async (googleData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google', googleData);
    localStorage.setItem('token', data.token);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Google login failed');
  }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (address, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/addresses', address);
    return data.data.addresses;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add address');
  }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, { rejectWithValue }) => {
  try {
    await api.delete(`/auth/addresses/${addressId}`);
    return addressId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete address');
  }
});

// ── Slice ───────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    initializing: true,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isAdmin = ['admin', 'superadmin'].includes(action.payload?.role);
    },
    updateWishlist: (state, action) => {
      if (state.user) state.user.wishlist = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = ['admin', 'superadmin'].includes(action.payload?.role);
        toast.success('Welcome back!');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        toast.success('Account created successfully!');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Fetch Me
    builder
      .addCase(fetchCurrentUser.pending, (state) => { state.initializing = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.initializing = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = ['admin', 'superadmin'].includes(action.payload?.role);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.initializing = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      toast.success('Logged out successfully');
    });

    // Update profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        toast.success('Profile updated successfully');
      })
      .addCase(updateProfile.rejected, (state, action) => {
        toast.error(action.payload);
      });

    // Google login
    builder
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = ['admin', 'superadmin'].includes(action.payload?.role);
        toast.success('Logged in with Google!');
      })
      .addCase(googleLogin.rejected, (state, action) => {
        toast.error(action.payload);
      });

    // Addresses
    builder
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) state.user.addresses = action.payload;
        toast.success('Address added');
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = state.user.addresses.filter(a => a._id !== action.payload);
        }
        toast.success('Address deleted');
      });
  },
});

export const { clearError, setUser, updateWishlist } = authSlice.actions;
export default authSlice.reducer;
