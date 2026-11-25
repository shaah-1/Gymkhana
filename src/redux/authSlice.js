import { createSlice } from "@reduxjs/toolkit";
import { storage as localStorage } from "../utils/storage";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: null,
    isAuthenticated: false,
    user: null,
    initialized: false,
  },
  reducers: {
    authInitialized: (state) => {
      state.initialized = true;
    },
    loginSuccess: (state, { payload: user }) => {
      state.user = user;
      state.userId = String(user.id);
      state.isAuthenticated = true;
      state.initialized = true;
      localStorage.setItem("userId", String(user.id));
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.userId = null;
      state.isAuthenticated = false;
      state.initialized = true;
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
    },
    setUser: (state, { payload: user }) => {
      state.user = user;
      state.userId = String(user.id);
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(user));
    },
  },
});

export const { authInitialized, loginSuccess, logout, setUser } =
  authSlice.actions;
export default authSlice.reducer;
