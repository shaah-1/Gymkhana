import api from "./api";

export const getCart = (userId) =>
  api
    .get("/carts", { params: { userId: String(userId) } })
    .then((r) => (Array.isArray(r.data) ? r.data : []));

export const addCartItem = (item) =>
  api.post("/carts", item).then((r) => r.data);

export const updateCartItem = (id, updates) =>
  api.patch(`/carts/${id}`, updates).then((r) => r.data);

export const deleteCartItem = (id) =>
  api.delete(`/carts/${id}`).then(() => id);
