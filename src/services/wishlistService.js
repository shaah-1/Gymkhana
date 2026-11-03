import api from "./api";

export const getWishlist = (userId) =>
  api
    .get("/wishlists", { params: { userId: String(userId) } })
    .then((r) => (Array.isArray(r.data) ? r.data : []));

export const addWishlistItem = (item) =>
  api.post("/wishlists", item).then((r) => r.data);

export const deleteWishlistItem = (id) =>
  api.delete(`/wishlists/${id}`).then(() => id);
