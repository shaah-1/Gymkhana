import api from "../../services/api";

export const getUsers = () =>
  api.get("/users").then((r) => (Array.isArray(r.data) ? r.data : []));

export const updateUser = (id, changes) =>
  api.patch(`/users/${encodeURIComponent(id)}`, changes).then((r) => r.data);
