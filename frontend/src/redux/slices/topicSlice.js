import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

export const fetchTopicsForDocument = createAsyncThunk(
  "topics/fetchForDocument",
  async (documentId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/keytopics/document/${documentId}`);
      return data.data || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to load topics"
      );
    }
  }
);

const topicSlice = createSlice({
  name: "topics",
  initialState: {
    topics: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTopics(state) {
      state.topics = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopicsForDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopicsForDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload;
      })
      .addCase(fetchTopicsForDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.topics = [];
      });
  },
});

export const { clearTopics } = topicSlice.actions;
export default topicSlice.reducer;
