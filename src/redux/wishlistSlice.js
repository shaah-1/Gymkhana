
import { createSlice } from "@reduxjs/toolkit";

const loadWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  } catch {
    return [];
  }
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: loadWishlist(),
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;

      const exists = state.items.some(
        (item) => String(item.id) === String(product.id)
      );

      if (exists) {
        state.items = state.items.filter(
          (item) => String(item.id) !== String(product.id)
        );
      } else {
        state.items.push(product);
      }

      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },

    clearWishlist: (state) => {
      state.items = [];
      localStorage.setItem("wishlist", JSON.stringify(state.items));
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
