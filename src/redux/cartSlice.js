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
      const existing = state.items.find((i) => String(i.id) === String(product.id));
      const stock = Math.max(0, Number(product.stock ?? 0));
      if (stock <= 0) return;
      const count = Math.max(1, Number(product.quantity) || 1);
      if (existing) {
        existing.quantity = Math.min(stock, existing.quantity + count);
      } else {
        state.items.push({ ...product, quantity: Math.min(stock, count) });
      }
    },
    increaseQuantity: (state, { payload: id }) => {
      const item = state.items.find((i) => String(i.id) === String(id));
      if (item && item.quantity < Number(item.stock ?? 0)) item.quantity += 1;
    },
    decreaseQuantity: (state, { payload: id }) => {
      const item = state.items.find((i) => String(i.id) === String(id));
      if (item && item.quantity > 1) item.quantity -= 1;
    },
    removeFromCart: (state, { payload: id }) => {
      state.items = state.items.filter((i) => String(i.id) !== String(id));
    },
    clearCart: (state) => { state.items = []; },
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
