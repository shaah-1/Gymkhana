import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getOrders, updateOrder } from "../../services/orderService";

export const fetchAdminOrders = createAsyncThunk(
  "adminOrders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await getOrders();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Could not load orders");
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  "adminOrders/updateStatus",
  async ({ id, status, paymentStatus, ...rest }, { rejectWithValue }) => {
    try {
      const payload = { ...rest };
      if (status !== undefined) payload.status = status;
      if (paymentStatus !== undefined) payload.paymentStatus = paymentStatus;
      return await updateOrder(id, payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Could not update order");
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
    statusError: null,
    updatingOrderId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateAdminOrderStatus.pending, (state, action) => {
        state.statusError = null;
        state.updatingOrderId = String(action.meta.arg.id);
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.updatingOrderId = null;
        state.statusError = action.payload || action.error.message || "Could not update order";
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => String(order.id) === String(action.payload.id)
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.updatingOrderId = null;
        state.statusError = null;
      });
  },
});

export default adminOrderSlice.reducer;
