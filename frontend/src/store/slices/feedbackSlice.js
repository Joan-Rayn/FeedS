import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackService } from '../../services';

export const fetchFeedbacks = createAsyncThunk(
  'feedback/fetchFeedbacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await feedbackService.getAllFeedbacks();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFeedback = createAsyncThunk(
  'feedback/createFeedback',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await feedbackService.createFeedback(feedbackData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFeedback = createAsyncThunk(
  'feedback/updateFeedback',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await feedbackService.updateFeedback(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserFeedbacks = createAsyncThunk(
  'feedback/getUserFeedbacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await feedbackService.getUserFeedbacks();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFeedbackStatus = createAsyncThunk(
  'feedback/updateFeedbackStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await feedbackService.updateFeedbackStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    feedbacks: [],
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
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks.push(action.payload);
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.feedbacks.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = feedbackSlice.actions;
export default feedbackSlice.reducer;