import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUsers,
  toggleUserBlocked,
} from "../store/slices/adminUserSlice";

function Users() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.adminUsers);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleToggleBlock = async (user) => {
    const action = user.blocked ? "unblock" : "block";
    const name = user.name || user.fullName || user.email;
    if (window.confirm(`Are you sure you want to ${action} "${name}"?`)) {
      await dispatch(toggleUserBlocked(user));
    }
  };

  const clientUsers = users.filter((u) => u.role !== "admin" && !u.isAdmin);

  const filteredUsers = clientUsers.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const name = (u.name || u.fullName || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <section>
      {/* Breadcrumbs */}
      <div className="eden-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <span style={{ color: "var(--eden-black)", fontWeight: 500 }}>
          Users
        </span>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h1 className="eden-page-title" style={{ margin: 0 }}>
          CLIENT ACCOUNTS <span className="eden-title-num">({clientUsers.length})</span>
        </h1>
        <p style={{ margin: "6px 0 0", color: "#6f7177", fontSize: "12.5px" }}>
          Registered customer accounts, contact directories, and authorization.
        </p>
      </div>

      {/* Filter line */}
      <div style={{ maxWidth: "340px", marginBottom: "24px" }}>
        <input
          type="search"
          className="eden-underline-input"
          placeholder="Filter by name or email address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && users.length === 0 ? (
        <p style={{ color: "#7a7c82" }}>Loading customer accounts...</p>
      ) : error ? (
        <div className="eden-error-notice">{error}</div>
      ) : filteredUsers.length === 0 ? (
        <p style={{ color: "#7a7c82" }}>No user accounts found matching your search.</p>
      ) : (
        <div className="eden-table-container">
          <table className="eden-table">
            <thead>
              <tr>
                <th>User / Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Access Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span style={{ color: "var(--eden-black)", fontWeight: 600 }}>
                      {user.name || user.fullName || "Customer"}
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.08em" }}>
                      {user.role || "Customer"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`eden-status-tag ${
                        user.blocked ? "cancelled" : "delivered"
                      }`}
                    >
                      {user.blocked ? "BLOCKED" : "ACTIVE"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(user)}
                      style={{
                        background: "none",
                        border: "none",
                        color: user.blocked ? "#204b2b" : "#793232",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        padding: 0,
                      }}
                    >
                      {user.blocked ? "Restore Access" : "Block User"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Users;
