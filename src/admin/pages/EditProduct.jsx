import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  fetchAdminProducts,
  updateAdminProduct,
} from "../store/slices/adminProductSlice";

function EditProductForm({ product, onSave }) {
  const [form, setForm] = useState({
    name: product.name || product.title || "",
    price: product.price ?? "",
    stock: product.stock ?? "",
    category: product.category || "",
    description: product.description || "",
    image: product.image || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const priceNum = Number(form.price);
    const stockNum = Number(form.stock);

    if (isNaN(priceNum) || priceNum < 0) {
      return setError("Please provide a valid price.");
    }
    if (isNaN(stockNum) || stockNum < 0) {
      return setError("Please provide a valid stock quantity.");
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        price: priceNum,
        stock: stockNum,
      });
    } catch (err) {
      setError(err?.message || "Failed to update product");
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--admin-surface)",
        border: "1px solid var(--admin-border)",
        padding: "clamp(24px, 4vw, 44px)",
        maxWidth: "840px",
      }}
    >
      {error && <div className="admin-error-notice">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin-form-grid" style={{ marginBottom: "32px" }}>
          <div className="admin-field-group">
            <label htmlFor="ep-name" className="admin-field-label">
              Product Title
            </label>
            <input
              id="ep-name"
              name="name"
              className="admin-underline-input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-field-group">
            <label htmlFor="ep-category" className="admin-field-label">
              Category
            </label>
            <input
              id="ep-category"
              name="category"
              className="admin-underline-input"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="admin-field-group">
            <label htmlFor="ep-price" className="admin-field-label">
              Retail Price (₹)
            </label>
            <input
              id="ep-price"
              name="price"
              type="number"
              min="0"
              className="admin-underline-input"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-field-group">
            <label htmlFor="ep-stock" className="admin-field-label">
              Inventory Units
            </label>
            <input
              id="ep-stock"
              name="stock"
              type="number"
              min="0"
              className="admin-underline-input"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-field-group full-width">
            <label htmlFor="ep-image" className="admin-field-label">
              Image Path or URL
            </label>
            <input
              id="ep-image"
              name="image"
              className="admin-underline-input"
              value={form.image}
              onChange={handleChange}
              placeholder="/products/example.png"
            />
          </div>

          <div className="admin-field-group full-width">
            <label htmlFor="ep-desc" className="admin-field-label">
              Formulation & Overview
            </label>
            <textarea
              id="ep-desc"
              name="description"
              className="admin-underline-input"
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <button type="submit" className="admin-btn-black" disabled={saving}>
            <span>{saving ? "SAVING..." : "UPDATE PRODUCT"}</span>
            <ArrowRight size={13} />
          </button>
          <Link to="/admin/products" className="admin-btn-outline">
            CANCEL
          </Link>
        </div>
      </form>
    </div>
  );
}

function EditProduct() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const product = useSelector((state) =>
    state.adminProducts.products.find((item) => String(item.id) === String(id))
  );

  useEffect(() => {
    if (!product) dispatch(fetchAdminProducts());
  }, [dispatch, product]);

  const handleSave = async (changes) => {
    await dispatch(updateAdminProduct({ id, changes })).unwrap();
    navigate("/admin/products");
  };

  return (
    <section>
      {/* Breadcrumbs */}
      <div className="admin-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <Link to="/admin/products">Products</Link>
        <span>/</span>
        <span style={{ color: "var(--admin-black)", fontWeight: 500 }}>
          Edit
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
            EDIT PRODUCT
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6f7177", fontSize: "12.5px" }}>
            Modify retail price, inventory stock, or ingredient specifications.
          </p>
        </div>

        <Link
          to="/admin/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#6f7177",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={13} />
          <span>Catalog</span>
        </Link>
      </div>

      {!product ? (
        <p style={{ color: "#6f7177" }}>Loading product specifications...</p>
      ) : (
        <EditProductForm
          key={product.id}
          product={product}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

export default EditProduct;
