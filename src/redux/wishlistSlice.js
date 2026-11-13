import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { storage as localStorage } from "../utils/storage";
import { logout } from "./authSlice";
import {
  getWishlist,
  addWishlistItem,
  deleteWishlistItem,
} from "../services/wishlistService";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const uid = userId || getState().auth.userId || localStorage.getItem("userId");
      if (!uid) return [];
      return await getWishlist(uid);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch wishlist");
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (product, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth.userId || localStorage.getItem("userId");
      if (!userId) {
        return rejectWithValue("Please log in to manage your wishlist");
      }

      const prodId = String(product.productId || product.id);
      const existing = state.wishlist.items.find(
        (item) => String(item.productId || item.id) === prodId
      );

      if (existing) {
        try {
          await deleteWishlistItem(existing.id);
        } catch (delErr) {
          // If already removed on server (404), gracefully continue and update local state
          if (delErr.response?.status !== 404) {
            console.warn("Wishlist item removal issue:", delErr);
          }
        }
        return { id: existing.id, productId: prodId, removed: true };
      }

      const newItem = await addWishlistItem({
        userId: String(userId),
        productId: prodId,
        name: product.name,
        category: product.category || "",
        price: Number(product.price) || 0,
        image: product.image,
        stock: Number(product.stock ?? 0),
      });

      return newItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to update wishlist");
    }
  }
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (userIdArg, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = userIdArg || state.auth.userId || localStorage.getItem("userId");
      if (!userId) return null;

      const items = state.wishlist.items.length > 0 ? state.wishlist.items : await getWishlist(userId);
      await Promise.all(items.map((item) => deleteWishlistItem(item.id)));
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to clear wishlist");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const result = action.payload;
        if (!result) return;
        if (result.removed) {
          state.items = state.items.filter(
            (item) =>
              String(item.productId || item.id) !== String(result.productId) &&
              String(item.id) !== String(result.id)
          );
          return;
        }

        const alreadyAdded = state.items.some(
          (item) => String(item.productId || item.id) === String(result.productId)
        );
        if (!alreadyAdded) {
          state.items.push(result);
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
      })

      .addCase(logout, (state) => {
        state.items = [];
        state.error = null;
      });
  },
});

export default wishlistSlice.reducer;
