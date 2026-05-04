import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

function readStoredAuth() {
  try {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    return { token: token || null, user };
  } catch {
    return { token: null, user: null };
  }
}

const persisted = readStoredAuth();

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Login failed";
      return rejectWithValue(msg);
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/auth/signup", {
        username,
        email,
        password,
      });
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Signup failed";
      return rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: persisted.user,
    token: persisted.token,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
