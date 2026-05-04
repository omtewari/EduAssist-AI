import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

export const fetchUserDocuments = createAsyncThunk(
  "document/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/documents/user");
      return data.data || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to load documents"
      );
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  "document/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/documents/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Document not found"
      );
    }
  }
);

export const fetchDocumentStatus = createAsyncThunk(
  "document/fetchStatus",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/documents/${id}/status`);
      return { documentId: id, status: data.status, error: data.error };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Status failed"
      );
    }
  }
);

export const uploadDocument = createAsyncThunk(
  "document/upload",
  async ({ file, title, onProgress }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title?.trim()) {
      formData.append("title", title.trim());
    }
    try {
      const { data } = await API.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => {
          if (onProgress && ev.total) {
            onProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Upload failed"
      );
    }
  }
);

export const startDocumentProcessing = createAsyncThunk(
  "document/process",
  async (documentId, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/documents/${documentId}/process`);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Processing failed"
      );
    }
  }
);

const documentSlice = createSlice({
  name: "document",
  initialState: {
    documents: [],
    selectedDocument: null,
    listLoading: false,
    detailLoading: false,
    uploadLoading: false,
    processLoading: false,
    error: null,
  },
  reducers: {
    clearDocumentError(state) {
      state.error = null;
    },
    clearSelectedDocument(state) {
      state.selectedDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDocuments.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDocuments.fulfilled, (state, action) => {
        state.listLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchUserDocuments.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDocumentById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
        state.selectedDocument = null;
      })
      .addCase(fetchDocumentStatus.fulfilled, (state, action) => {
        const { documentId, status, error } = action.payload;
        const doc = state.documents.find(
          (d) => d._id === documentId || d._id === String(documentId)
        );
        if (doc) {
          doc.status = status;
          if (error !== undefined) doc.errorMessage = error;
        }
        if (
          state.selectedDocument &&
          (state.selectedDocument._id === documentId ||
            state.selectedDocument._id === String(documentId))
        ) {
          state.selectedDocument.status = status;
          if (error !== undefined) {
            state.selectedDocument.errorMessage = error;
          }
        }
      })
      .addCase(uploadDocument.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state) => {
        state.uploadLoading = false;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      })
      .addCase(startDocumentProcessing.pending, (state) => {
        state.processLoading = true;
        state.error = null;
      })
      .addCase(startDocumentProcessing.fulfilled, (state, action) => {
        state.processLoading = false;
        const id = action.payload.documentId;
        const doc = state.documents.find(
          (d) => d._id === id || d._id === String(id)
        );
        if (doc) doc.status = "processing";
      })
      .addCase(startDocumentProcessing.rejected, (state, action) => {
        state.processLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDocumentError, clearSelectedDocument } =
  documentSlice.actions;
export default documentSlice.reducer;
