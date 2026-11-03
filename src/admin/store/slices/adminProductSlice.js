import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await getProducts();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Could not load products");
    }
  }
);

export const addAdminProduct = createAsyncThunk(
  "adminProducts/addProduct",
  async (product, { rejectWithValue }) => {
    try {
      return await addProduct(product);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Could not add product");
    }
  }
);

export const updateAdminProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      return await updateProduct(id, changes);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Could not update product");
    }
  }
);

export const deleteAdminProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteProduct(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Could not delete product");
    }
  }
);

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addAdminProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (product) => String(product.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (product) => String(product.id) !== String(action.payload)
        );
      });
  },
});

export default adminProductSlice.reducer;
