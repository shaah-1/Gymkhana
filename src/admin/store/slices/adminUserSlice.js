import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUsers, updateUser } from "../../services/userService";

export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await getUsers();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Could not load users");
    }
  }
);

export const toggleUserBlocked = createAsyncThunk(
  "adminUsers/toggleBlocked",
  async (user, { rejectWithValue }) => {
    try {
      return await updateUser(user.id, { blocked: !user.blocked });
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Could not update user");
    }
  }
);

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState: {
    users: [],
    loading: false,
    error: null,
    updateError: null,
    updatingUserId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(toggleUserBlocked.pending, (state, action) => {
        state.updateError = null;
        state.updatingUserId = String(action.meta.arg.id);
      })
      .addCase(toggleUserBlocked.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => String(user.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.updatingUserId = null;
        state.updateError = null;
      })
      .addCase(toggleUserBlocked.rejected, (state, action) => {
        state.updatingUserId = null;
        state.updateError = action.payload || action.error.message || "Could not update user";
      });
  },
});

export default adminUserSlice.reducer;
