import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUsers,
  toggleUserBlocked,
} from "../store/slices/adminUserSlice";
import {
  adminBreadcrumbLinkClass,
  adminBreadcrumbsClass,
  adminErrorNoticeClass,
  adminPageHeaderClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
  adminSearchWrapClass,
  adminStatusTagClass,
  adminTableClass,
  adminTableContainerClass,
  adminTdClass,
  adminThClass,
  adminTitleNumClass,
  adminUnderlineInputClass,
} from "../adminClasses";

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
      <div className={adminBreadcrumbsClass}>
        <Link to="/admin" className={adminBreadcrumbLinkClass}>
          Administration
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <span className="font-medium text-[#121214]">Users</span>
      </div>

      <div className={adminPageHeaderClass}>
        <div>
          <h1 className={adminPageTitleClass}>
            CLIENT ACCOUNTS <span className={adminTitleNumClass}>({clientUsers.length})</span>
          </h1>
          <p className={adminPageSubtitleClass}>
            Registered customer accounts, contact directories, and authorization.
          </p>
        </div>
      </div>

      {/* Filter line */}
      <div className={adminSearchWrapClass}>
        <input
          type="search"
          className={adminUnderlineInputClass}
          placeholder="Filter by name or email address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && users.length === 0 ? (
        <p className="text-[#7a7c82]">Loading customer accounts...</p>
      ) : error ? (
        <div className={adminErrorNoticeClass}>{error}</div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-[#7a7c82]">No user accounts found matching your search.</p>
      ) : (
        <div className={adminTableContainerClass}>
          <table className={adminTableClass}>
            <thead>
              <tr>
                <th className={adminThClass}>User / Name</th>
                <th className={adminThClass}>Email Address</th>
                <th className={adminThClass}>Role</th>
                <th className={adminThClass}>Account Status</th>
                <th className={adminThClass}>Access Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group/row hover:bg-[#fafafc]">
                  <td className={adminTdClass}>
                    <span className="font-semibold text-[#121214]">
                      {user.name || user.fullName || "Customer"}
                    </span>
                  </td>
                  <td className={adminTdClass}>{user.email}</td>
                  <td className={adminTdClass}>
                    <span className="text-[11px] tracking-[0.08em] uppercase">
                      {user.role || "Customer"}
                    </span>
                  </td>
                  <td className={adminTdClass}>
                    <span
                      className={adminStatusTagClass(
                        user.blocked ? "cancelled" : "delivered"
                      )}
                    >
                      {user.blocked ? "BLOCKED" : "ACTIVE"}
                    </span>
                  </td>
                  <td className={adminTdClass}>
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(user)}
                      className={`cursor-pointer border-0 bg-transparent p-0 text-[11px] font-semibold tracking-[0.14em] uppercase transition-opacity duration-150 hover:opacity-70 ${
                        user.blocked ? "text-[#204b2b]" : "text-[#793232]"
                      }`}
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
