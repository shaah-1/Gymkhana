import api from "../../services/api";

export const getProducts = () =>
  api.get("/products").then((r) => (Array.isArray(r.data) ? r.data : []));

export const addProduct = (product) =>
  api.post("/products", product).then((r) => r.data);

export const updateProduct = (id, changes) =>
  api.patch(`/products/${encodeURIComponent(id)}`, changes).then((r) => r.data);

export const deleteProduct = (id) =>
  api.delete(`/products/${encodeURIComponent(id)}`).then(() => id);
