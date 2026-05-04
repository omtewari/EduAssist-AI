import { createSlice } from "@reduxjs/toolkit";
import {
  defaultDocProgress,
  loadReadingProgressFromStorage,
} from "../../utils/readingProgress";

function ensureDoc(state, documentId) {
  const key = String(documentId);
  if (!state.documents[key]) {
    state.documents[key] = defaultDocProgress();
  }
  return state.documents[key];
}

const progressSlice = createSlice({
  name: "progress",
  initialState: {
    documents: loadReadingProgressFromStorage(),
  },
  reducers: {
    recordFlashcardFlip(state, action) {
      const { documentId, cardId } = action.payload;
      if (!documentId || !cardId) return;
      const doc = ensureDoc(state, documentId);
      doc.flippedIds[String(cardId)] = true;
    },
    setFlashcardTotal(state, action) {
      const { documentId, total } = action.payload;
      if (documentId === undefined || documentId === null) return;
      const doc = ensureDoc(state, documentId);
      doc.totalFlashcards =
        typeof total === "number" && total >= 0 ? total : 0;
    },
    setSummaryComplete(state, action) {
      const { documentId, complete } = action.payload;
      if (!documentId) return;
      const doc = ensureDoc(state, documentId);
      doc.summaryComplete = Boolean(complete);
    },
    setTopicsSeen(state, action) {
      const { documentId, seen } = action.payload;
      if (!documentId) return;
      const doc = ensureDoc(state, documentId);
      doc.topicsSeen = seen !== false;
    },
  },
});

export const {
  recordFlashcardFlip,
  setFlashcardTotal,
  setSummaryComplete,
  setTopicsSeen,
} = progressSlice.actions;

export default progressSlice.reducer;
