import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import documentReducer from "./slices/documentSlice";
import flashcardReducer from "./slices/flashcardSlice";
import topicReducer from "./slices/topicSlice";
import progressReducer from "./slices/progressSlice";
import { READING_PROGRESS_STORAGE_KEY } from "../utils/readingProgress.js";

const persistProgressMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (
    typeof action.type === "string" &&
    action.type.startsWith("progress/")
  ) {
    try {
      localStorage.setItem(
        READING_PROGRESS_STORAGE_KEY,
        JSON.stringify(store.getState().progress.documents)
      );
    } catch {
      /* ignore quota / private mode */
    }
  }
  return result;
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    document: documentReducer,
    flashcards: flashcardReducer,
    topics: topicReducer,
    progress: progressReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistProgressMiddleware),
});

export default store;