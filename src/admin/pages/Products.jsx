import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Trash2, Edit2 } from "lucide-react";
import {
  fetchAdminProducts,
  deleteAdminProduct,
} from "../store/slices/adminProductSlice";
import AdminPrice from "../components/AdminPrice";
import { publicAssetUrl } from "../../utils/publicAssetUrl";

function Products() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(
    (state) => state.adminProducts
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name || "this product"}"?`
      )
    ) {
      await dispatch(deleteAdminProduct(id));
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const name = (p.name || p.title || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    return name.includes(q) || category.includes(q);
  });

  return (
    <section>
      {/* Breadcrumbs */}
      <div className="admin-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <span style={{ color: "var(--admin-black)", fontWeight: 500 }}>
          Products
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 className="admin-page-title" style={{ margin: 0 }}>
            CATALOG <span className="admin-title-num">({products.length})</span>
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6f7177", fontSize: "12.5px" }}>
            Curate specifications, stock availability, and retail pricing.
          </p>
        </div>

        <Link to="/admin/products/add" className="admin-btn-black">
          <span>ADD PRODUCT</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Filter line */}
      <div style={{ maxWidth: "340px", marginBottom: "24px" }}>
        <input
          type="search"
          className="admin-underline-input"
          placeholder="Filter by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && products.length === 0 ? (
        <p style={{ color: "#7a7c82" }}>Loading catalog...</p>
      ) : error ? (
        <div className="admin-error-notice">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <p style={{ color: "#7a7c82" }}>No products found matching your search.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stock = Number(product.stock ?? 0);
                const isOutOfStock = stock <= 0;
                const isLowStock = !isOutOfStock && stock <= 5;
                const statusClass = isOutOfStock
                  ? "cancelled"
                  : isLowStock
                  ? "pending"
                  : "delivered";

                return (
                  <tr key={product.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            background: "var(--admin-light-box)",
                            border: "1px solid var(--admin-border)",
                            display: "grid",
                            placeItems: "center",
                            padding: "4px",
                            boxSizing: "border-box",
                          }}
                        >
                          <img
                            src={publicAssetUrl(
                              product.image || "/products/whey-protein.png"
                            )}
                            alt={product.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, color: "var(--admin-black)" }}>
                          {product.name || product.title}
                        </span>
                      </div>
                    </td>
                    <td>{product.category || "—"}</td>
                    <td>
                      <strong className="admin-num">
                        <AdminPrice amount={product.price} />
                      </strong>
                    </td>
                    <td>
                      <span className={`admin-status-tag ${statusClass}`}>
                        {isOutOfStock ? (
                          "OUT OF STOCK"
                        ) : isLowStock ? (
                          <>
                            <strong className="admin-stock-qty">{stock}</strong> LOW STOCK
                          </>
                        ) : (
                          <>
                            <strong className="admin-stock-qty">{stock}</strong> IN STOCK
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="admin-action-link"
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id, product.name)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#8c4242",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Products;
