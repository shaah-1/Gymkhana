import { createSlice } from "@reduxjs/toolkit";

const loadSavedAdmin = () => {
  try {
    const saved = localStorage.getItem("admin");
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
      const { email, password } = action.payload;

      if (
        email?.trim().toLowerCase() === "admin@gymkhana.com" &&
        password === "admin123"
      ) {
        const admin = { email: email.trim().toLowerCase() };
        state.admin = admin;
        state.isAuthenticated = true;
        localStorage.setItem("admin", JSON.stringify(admin));
      }
    },

    adminLogout: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      localStorage.removeItem("admin");
    },
  },
});

export const { adminLogin, adminLogout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
