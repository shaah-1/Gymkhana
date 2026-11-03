import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import productReducer from "./productSlice";
import authReducer from "./authSlice";

import adminAuthReducer from "../admin/store/slices/adminAuthSlice";
import adminProductReducer from "../admin/store/slices/adminProductSlice";
import adminUserReducer from "../admin/store/slices/adminUserSlice";
import adminOrderReducer from "../admin/store/slices/adminOrderSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
    auth: authReducer,

    adminAuth: adminAuthReducer,
    adminProducts: adminProductReducer,
    adminUsers: adminUserReducer,
    adminOrders: adminOrderReducer,
  },
});

export default store;
