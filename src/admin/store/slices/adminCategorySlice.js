import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProducts } from "../../../services/productService";

export const fetchAdminCategories = createAsyncThunk(
  "adminCategories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const products = await getProducts();
      return [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Could not load categories");
    }
  }
);

const adminCategorySlice = createSlice({
  name: "adminCategories",
  initialState: { categories: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default adminCategorySlice.reducer;
