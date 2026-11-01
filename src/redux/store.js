import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import productReducer from "./productSlice";
import authReducer from "./authSlice";
import wishlistReducer from "./wishlistSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
    auth: authReducer,
  },
});

let prevCart = store.getState().cart.items;
let prevWishlist = store.getState().wishlist.items;

store.subscribe(() => {
  const { cart, wishlist } = store.getState();
  try {
    if (cart.items !== prevCart) {
      localStorage.setItem("cart", JSON.stringify(cart.items));
      prevCart = cart.items;
    }
    if (wishlist.items !== prevWishlist) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist.items));
      prevWishlist = wishlist.items;
    }
  } catch (err) {
    console.error("Storage error:", err);
  }
});
