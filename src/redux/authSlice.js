import { createSlice } from "@reduxjs/toolkit";

const savedId = localStorage.getItem("userId");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: savedId || null,
    isAuthenticated: Boolean(savedId),
    user: null,
  },
  reducers: {
    loginSuccess: (state, { payload: user }) => {
      state.user = user;
      state.userId = String(user.id);
      state.isAuthenticated = true;
      localStorage.setItem("userId", String(user.id));
    },
    logout: (state) => {
      state.user = null;
      state.userId = null;
      state.isAuthenticated = false;
      localStorage.removeItem("userId");
    },
    setUser: (state, { payload: user }) => {
      state.user = user;
      state.userId = String(user.id);
      state.isAuthenticated = true;
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
