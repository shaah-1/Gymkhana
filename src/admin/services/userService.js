import api from "../../services/api";

export const getUsers = () =>
  api.get("/users").then((r) => (Array.isArray(r.data) ? r.data : []));

export const updateUser = (id, changes) =>
  api.patch(`/users/${encodeURIComponent(id)}`, changes).then((r) => r.data);

export const saveAdminUser = async (changes) => {
  try {
    return await api.patch("/users/admin-1", changes).then((r) => r.data);
  } catch (err) {
    if (err.response?.status === 404) {
      return await api
        .post("/users", {
          id: "admin-1",
          name: "Admin",
          role: "admin",
          isAdmin: true,
          ...changes,
        })
        .then((r) => r.data);
    }
    throw err;
  }
};
