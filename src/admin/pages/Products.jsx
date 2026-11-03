import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import {
  fetchAdminProducts,
  deleteAdminProduct,
} from "../store/slices/adminProductSlice";
import { formatCurrency } from "../../utils/formatters";
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
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CATALOG</p>
          <h2>Products ({products.length})</h2>
          <p>Manage all inventory, pricing, and stock levels.</p>
        </div>
        <Link
          to="/admin/products/add"
          className="admin-form"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            background: "#ffffff",
            color: "#0b0c0e",
            borderRadius: "9999px",
            textDecoration: "none",
            fontSize: "12px",
            fontWeight: 600,
            margin: 0,
            border: "none",
          }}
        >
          <Plus size={15} strokeWidth={2.2} />
          <span>Add product</span>
        </Link>
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
            placeholder="Filter by name or category..."
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

        {loading && products.length === 0 ? (
          <p style={{ color: "#8e9198", fontSize: "13px" }}>
            Loading products...
          </p>
        ) : error ? (
          <p className="admin-login-error-banner">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ color: "#8e9198", fontSize: "13px" }}>
            No products found matching your search.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stock = Number(product.stock ?? 0);
                  const isOutOfStock = stock <= 0;

                  return (
                    <tr key={product.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <img
                            src={publicAssetUrl(
                              product.image || "/products/whey-protein.png"
                            )}
                            alt={product.name}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              background: "#17181d",
                              border: "1px solid #23252c",
                              objectFit: "cover",
                              padding: "2px",
                            }}
                          />
                          <span style={{ fontWeight: 500, color: "#ffffff" }}>
                            {product.name || product.title}
                          </span>
                        </div>
                      </td>
                      <td>{product.category || "—"}</td>
                      <td>
                        <strong>
                          {formatCurrency(Number(product.price || 0))}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${
                            isOutOfStock ? "cancelled" : "delivered"
                          }`}
                        >
                          <span className="dot" />
                          <span>
                            {isOutOfStock ? "Out of Stock" : `${stock} in stock`}
                          </span>
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="admin-icon-btn"
                            title="Edit product"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{ color: "#f87171" }}
                            title="Delete product"
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                          >
                            <Trash2 size={13} />
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
      </div>
    </section>
  );
}

export default Products;
