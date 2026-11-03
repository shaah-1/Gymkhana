import { createSlice } from "@reduxjs/toolkit";

const savedId = localStorage.getItem("userId");
const loadSavedUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: savedId || null,
    isAuthenticated: Boolean(savedId),
    user: loadSavedUser(),
  },
  reducers: {
    loginSuccess: (state, { payload: user }) => {
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
      state.user = user;
      state.userId = String(user.id);
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(user));
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
