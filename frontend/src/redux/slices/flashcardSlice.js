import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

export const fetchFlashcardDeckForDocument = createAsyncThunk(
  "flashcards/fetchForDocument",
  async (documentId, { rejectWithValue }) => {
    try {
      const setsRes = await API.get(`/flashcards/document/${documentId}`);
      const sets = setsRes.data.data || [];
      if (sets.length === 0) {
        return { flashcardSet: null, flashcards: [] };
      }
      const latest = sets[0];
      const cardsRes = await API.get(`/flashcards/set/${latest._id}`);
      return cardsRes.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to load flashcards"
      );
    }
  }
);

const flashcardSlice = createSlice({
  name: "flashcards",
  initialState: {
    flashcardSet: null,
    flashcards: [],
    loading: false,
    error: null,
    documentId: null,
  },
  reducers: {
    clearFlashcards(state) {
      state.flashcardSet = null;
      state.flashcards = [];
      state.documentId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlashcardDeckForDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcardDeckForDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.flashcardSet = action.payload?.flashcardSet || null;
        state.flashcards = action.payload?.flashcards || [];
      })
      .addCase(fetchFlashcardDeckForDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.flashcards = [];
        state.flashcardSet = null;
      });
  },
});

export const { clearFlashcards } = flashcardSlice.actions;
export default flashcardSlice.reducer;
