import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
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

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const name = (u.name || u.fullName || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <section>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CUSTOMERS</p>
          <h2>Users ({users.length})</h2>
          <p>Monitor customer accounts, security, and permissions.</p>
        </div>
      </div>

      <div className="admin-card-panel">
        <div
          style={{
            position: "relative",
            maxWidth: "320px",
            marginBottom: "20px",
          }}
        >
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b6e76",
            }}
          />
          <input
            type="search"
            placeholder="Filter by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              height: "36px",
              padding: "0 14px 0 36px",
              background: "#17181d",
              border: "1px solid #23252c",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "12px",
              outline: "none",
            }}
          />
        </div>

        {loading && users.length === 0 ? (
          <p style={{ color: "#8e9198", fontSize: "13px" }}>Loading users...</p>
        ) : error ? (
          <p className="admin-login-error-banner">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p style={{ color: "#8e9198", fontSize: "13px" }}>
            No users found matching your search.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#1c1e24",
                            border: "1px solid #292b34",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: 600,
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {(user.name || user.fullName || user.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: "#ffffff" }}>
                          {user.name || user.fullName || "Customer"}
                        </span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#92959c",
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role || "Customer"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-status-pill ${
                          user.blocked ? "cancelled" : "delivered"
                        }`}
                      >
                        <span className="dot" />
                        <span>{user.blocked ? "Blocked" : "Active"}</span>
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleBlock(user)}
                        className="admin-icon-btn"
                        style={{
                          width: "auto",
                          padding: "6px 12px",
                          gap: "6px",
                          fontSize: "11px",
                          color: user.blocked ? "#4ade80" : "#f87171",
                          borderColor: user.blocked ? "#1e3a2b" : "#382326",
                        }}
                      >
                        {user.blocked ? (
                          <>
                            <ShieldCheck size={13} />
                            <span>Unblock</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert size={13} />
                            <span>Block</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Users;
