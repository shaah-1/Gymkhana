import { createSlice } from "@reduxjs/toolkit";
import { storage as localStorage } from "../utils/storage";

const loadSavedUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Admin accounts must never be treated as customer storefront sessions
    if (parsed?.role === "admin" || parsed?.isAdmin || parsed?.id === "admin-1") {
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const initialUser = loadSavedUser();
const savedId = initialUser ? localStorage.getItem("userId") : null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: savedId || null,
    isAuthenticated: Boolean(initialUser && savedId),
    user: initialUser,
  },
  reducers: {
    loginSuccess: (state, { payload: user }) => {
      // Do not log into customer session if the user is an admin
      if (user?.role === "admin" || user?.isAdmin || user?.id === "admin-1") {
        return;
      }
      state.user = user;
      state.userId = String(user.id);
      state.isAuthenticated = true;
      localStorage.setItem("userId", String(user.id));
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.userId = null;
      state.isAuthenticated = false;
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
    },
    setUser: (state, { payload: user }) => {
      if (user?.role === "admin" || user?.isAdmin || user?.id === "admin-1") {
        return;
      }
      state.user = user;
      state.userId = String(user.id);
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(user));
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
