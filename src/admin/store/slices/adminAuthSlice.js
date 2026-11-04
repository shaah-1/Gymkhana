import { createSlice } from "@reduxjs/toolkit";

const loadSavedAdmin = () => {
  try {
    const saved = localStorage.getItem("admin");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const loadSavedProfile = () => {
  try {
    const saved = localStorage.getItem("adminProfile");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const savedAdmin = loadSavedAdmin();

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    admin: savedAdmin,
    isAuthenticated: Boolean(savedAdmin),
  },
  reducers: {
    adminLogin: (state, action) => {
      const { email } = action.payload;

      const profile = loadSavedProfile() || {};
      const admin = { ...profile, email: email.trim().toLowerCase() };
      state.admin = admin;
      state.isAuthenticated = true;
      localStorage.setItem("admin", JSON.stringify(admin));
    },

    updateAdminProfile: (state, action) => {
      state.admin = { ...state.admin, ...action.payload };
      localStorage.setItem("adminProfile", JSON.stringify(state.admin));
      localStorage.setItem("admin", JSON.stringify(state.admin));
    },

    adminLogout: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      localStorage.removeItem("admin");
    },
  },
});

export const { adminLogin, adminLogout, updateAdminProfile } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
