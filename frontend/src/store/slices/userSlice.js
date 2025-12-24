import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${id}`, data, getAuthHeader());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`, getAuthHeader());
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;