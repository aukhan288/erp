// store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch CSRF cookie
export const fetchCsrf = createAsyncThunk(
  'auth/fetchCsrf',
  async (_, { rejectWithValue }) => {
    try {
      await api.get('/sanctum/csrf-cookie');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'CSRF fetch failed');
    }
  }
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(fetchCsrf()).unwrap();
      const res = await api.post('/login', { email, password });

      // Store token in localStorage
      const token = res.data.token;
      localStorage.setItem('auth_token', token);

      // Attach token to Axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// Fetch authenticated user
export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await api.get('/user');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Unauthorized');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/logout');
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch User
      .addCase(fetchUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUser.fulfilled, (state, action) => { state.user = action.payload; state.loading = false; })
      .addCase(fetchUser.rejected, (state, action) => { state.user = null; state.loading = false; state.error = action.payload; })

      // Login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.user = action.payload; state.loading = false; })
      .addCase(login.rejected, (state, action) => { state.user = null; state.loading = false; state.error = action.payload; })

      // Logout
      .addCase(logout.fulfilled, (state) => { state.user = null; state.error = null; })
      .addCase(logout.rejected, (state, action) => { state.error = action.payload; });
  },
});

export default authSlice.reducer;