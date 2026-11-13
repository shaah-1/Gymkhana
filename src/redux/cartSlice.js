import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { storage as localStorage } from "../utils/storage";
import { logout } from "./authSlice";
import {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
} from "../services/cartService";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const uid = userId || getState().auth.userId || localStorage.getItem("userId");
      if (!uid) return [];
      return await getCart(uid);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch cart");
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (product, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth.userId || localStorage.getItem("userId");
      if (!userId) {
        return rejectWithValue("Please log in to add items to your cart");
      }

      const prodId = String(product.productId || product.id);
      const stock = Math.max(0, Number(product.stock ?? 0));
      if (stock <= 0) {
        return rejectWithValue("Product is out of stock");
      }

      const countToAdd = Math.max(1, Number(product.quantity) || 1);

      const existing = state.cart.items.find(
        (item) => String(item.productId || item.id) === prodId
      );

      if (existing) {
        const newQty = Math.min(stock, Number(existing.quantity) + countToAdd);
        const updated = await updateCartItem(existing.id, { quantity: newQty });
        return updated;
      }

      const newItem = await addCartItem({
        userId: String(userId),
        productId: prodId,
        name: product.name,
        category: product.category || "",
        price: Number(product.price),
        image: product.image,
        stock,
        quantity: Math.min(stock, countToAdd),
      });

      return newItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to add to cart");
    }
  }
);

export const increaseQuantity = createAsyncThunk(
  "cart/increaseQuantity",
  async (idOrObj, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const id = typeof idOrObj === "object" ? idOrObj.id : idOrObj;
      const target = state.cart.items.find(
        (i) => String(i.id) === String(id) || String(i.productId) === String(id)
      );

      if (!target) return rejectWithValue("Item not found in cart");
      const stock = Number(target.stock ?? 0);
      if (stock > 0 && Number(target.quantity) >= stock) {
        return rejectWithValue("Maximum available stock reached");
      }

      const updated = await updateCartItem(target.id, {
        quantity: Number(target.quantity) + 1,
      });
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to increase quantity");
    }
  }
);

export const decreaseQuantity = createAsyncThunk(
  "cart/decreaseQuantity",
  async (idOrObj, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const id = typeof idOrObj === "object" ? idOrObj.id : idOrObj;
      const target = state.cart.items.find(
        (i) => String(i.id) === String(id) || String(i.productId) === String(id)
      );

      if (!target) return rejectWithValue("Item not found in cart");

      if (Number(target.quantity) <= 1) {
        await deleteCartItem(target.id);
        return { id: target.id, removed: true };
      }

      const updated = await updateCartItem(target.id, {
        quantity: Number(target.quantity) - 1,
      });
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to decrease quantity");
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const target = state.cart.items.find(
        (i) => String(i.id) === String(id) || String(i.productId) === String(id)
      );
      const targetId = target ? target.id : id;
      await deleteCartItem(targetId);
      return targetId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to remove item");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userIdArg, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = userIdArg || state.auth.userId || localStorage.getItem("userId");
      if (!userId) return null;

      const items = state.cart.items.length > 0 ? state.cart.items : await getCart(userId);
      await Promise.all(items.map((item) => deleteCartItem(item.id)));
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to clear cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        const item = action.payload;
        if (!item) return;
        const index = state.items.findIndex(
          (i) => String(i.id) === String(item.id) || String(i.productId) === String(item.productId)
        );
        if (index !== -1) {
          state.items[index] = item;
        } else {
          state.items.push(item);
        }
      })

      .addCase(increaseQuantity.fulfilled, (state, action) => {
        if (!action.payload) return;
        const index = state.items.findIndex(
          (i) => String(i.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        if (action.payload?.removed) {
          state.items = state.items.filter(
            (item) => String(item.id) !== String(action.payload.id)
          );
          return;
        }
        if (action.payload) {
          const index = state.items.findIndex(
            (item) => String(item.id) === String(action.payload.id)
          );
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      })

      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (i) => String(i.id) !== String(action.payload)
        );
      })

      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      })

      .addCase(logout, (state) => {
        state.items = [];
        state.error = null;
      });
  },
});

export default cartSlice.reducer;
