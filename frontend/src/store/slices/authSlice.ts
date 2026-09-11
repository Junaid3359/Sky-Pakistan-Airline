import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

type User = { id: string; email: string; role: string } | null;

export const loginAsync = createAsyncThunk('auth/login', async (data: { email: string; password: string }, thunkAPI) => {
  const res = await api.post('/auth/login', data);
  return res.data;
});

const initialState = { user: null as User, token: localStorage.getItem('token') || null, loading: false };

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loginAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loginAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
    });
    builder.addCase(loginAsync.rejected, (state) => {
      state.loading = false;
    });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;
