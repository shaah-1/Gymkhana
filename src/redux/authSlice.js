
import { createSlice } from "@reduxjs/toolkit";

const savedUserId = localStorage.getItem("userId");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: savedUserId || null,
    isAuthenticated: Boolean(savedUserId),
    user: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      const user = action.payload;

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

    setUser: (state, action) => {
      state.user = action.payload;
      state.userId = String(action.payload.id);
      state.isAuthenticated = true;
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
