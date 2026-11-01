import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProducts } from "../services/productService";

export const fetchProducts = createAsyncThunk("products/fetchProducts", () => getProducts());

const productSlice = createSlice({
  name: "products",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to load products"; });
  },
});

export default productSlice.reducer;
