
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

let previousCartItems = store.getState().cart.items;
let previousWishlistItems = store.getState().wishlist.items;

store.subscribe(() => {
  const { cart, wishlist } = store.getState();

  try {
    if (cart.items !== previousCartItems) {
      localStorage.setItem("cart", JSON.stringify(cart.items));
      previousCartItems = cart.items;
    }

    if (wishlist.items !== previousWishlistItems) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist.items));
      previousWishlistItems = wishlist.items;
    }
  } catch (error) {
    console.error("Unable to save cart or wishlist.", error);
  }
});
