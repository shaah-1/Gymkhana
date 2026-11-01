import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
  try {
    const s = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(s) ? s : [];
  } catch { return []; }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: loadCart() },
  reducers: {
    addToCart: (state, { payload: product }) => {
      const existing = state.items.find((i) => i.id === product.id);
      const stock = Number(product.stock ?? 0);
      if (stock <= 0) return;
      if (existing) {
        if (existing.quantity < stock) existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },
    increaseQuantity: (state, { payload: id }) => {
      const item = state.items.find((i) => i.id === id);
      if (item && item.quantity < Number(item.stock ?? 0)) item.quantity += 1;
    },
    decreaseQuantity: (state, { payload: id }) => {
      const item = state.items.find((i) => i.id === id);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
    removeFromCart: (state, { payload: id }) => {
      state.items = state.items.filter((i) => i.id !== id);
    },
    clearCart: (state) => { state.items = []; },
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
