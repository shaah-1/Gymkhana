import { createSlice } from "@reduxjs/toolkit";
import { storage as localStorage } from "../../../utils/storage";

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    admin: null,
    isAuthenticated: false,
  },
  reducers: {
    adminLogin: (state, action) => {
      state.admin = action.payload || null;
      state.isAuthenticated = Boolean(action.payload?.role === "admin");
    },
    updateAdminProfile: (state, action) => {
      state.admin = { ...state.admin, ...action.payload };
    },
    adminLogout: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      localStorage.removeItem("admin");
      localStorage.removeItem("adminProfile");
      localStorage.removeItem("adminCredentials");
    },
  },
});

export const { adminLogin, adminLogout, updateAdminProfile } =
  adminAuthSlice.actions;
export default adminAuthSlice.reducer;
