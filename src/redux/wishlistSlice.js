import { createSlice } from "@reduxjs/toolkit";

const loadWishlist = () => {
  try {
    const s = JSON.parse(localStorage.getItem("wishlist") || "[]");
    return Array.isArray(s) ? s : [];
  } catch { return []; }
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: loadWishlist() },
  reducers: {
    toggleWishlist: (state, { payload: product }) => {
      const exists = state.items.some((i) => String(i.id) === String(product.id));
      state.items = exists
        ? state.items.filter((i) => String(i.id) !== String(product.id))
        : [...state.items, product];
    },
    clearWishlist: (state) => { state.items = []; },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
