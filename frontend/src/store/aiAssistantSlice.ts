import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export interface AISectionState<T = any> {
  loading: boolean;
  data: T | null;
  error: string | null;
}

export interface AIAssistantState {
  review: AISectionState;
  explanation: AISectionState;
  comparison: AISectionState;
  complexity: AISectionState;
  dryRun: AISectionState;
  hints: AISectionState;
  testCases: AISectionState;
  interview: AISectionState;
  chat: AISectionState;
  summary: AISectionState;
  report: AISectionState;
}

const initialState: AIAssistantState = {
  review: { loading: false, data: null, error: null },
  explanation: { loading: false, data: null, error: null },
  comparison: { loading: false, data: null, error: null },
  complexity: { loading: false, data: null, error: null },
  dryRun: { loading: false, data: null, error: null },
  hints: { loading: false, data: null, error: null },
  testCases: { loading: false, data: null, error: null },
  interview: { loading: false, data: null, error: null },
  chat: { loading: false, data: null, error: null },
  summary: { loading: false, data: null, error: null },
  report: { loading: false, data: null, error: null },
};

// Example async thunk – you can generate similar thunks for each endpoint
export const fetchReview = createAsyncThunk(
  'aiAssistant/fetchReview',
  async (payload: { problemId: string; language: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    clearSection(state, action: PayloadAction<keyof AIAssistantState>) {
      const section = action.payload;
      state[section] = { loading: false, data: null, error: null } as any;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReview.pending, (state) => {
        state.review.loading = true;
        state.review.error = null;
      })
      .addCase(fetchReview.fulfilled, (state, action) => {
        state.review.loading = false;
        state.review.data = action.payload;
      })
      .addCase(fetchReview.rejected, (state, action) => {
        state.review.loading = false;
        state.review.error = action.payload as string;
      });
    // Add other thunks similarly
  },
});

export const { clearSection } = aiAssistantSlice.actions;
export const selectAISection = (section: keyof AIAssistantState) => (state: RootState) => state.aiAssistant[section];
export default aiAssistantSlice.reducer;
