import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { addAdminProduct } from "../store/slices/adminProductSlice";

function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: "",
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
      await dispatch(
        addAdminProduct({
          ...form,
          price: priceNum,
          stock: stockNum,
        })
      ).unwrap();

      navigate("/admin/products");
    } catch (err) {
      setError(err?.message || "Failed to create product");
      setSaving(false);
    }
  };

  return (
    <section>
      {/* Breadcrumbs */}
      <div className="eden-breadcrumbs">
        <Link to="/admin">Administration</Link>
        <span>/</span>
        <Link to="/admin/products">Products</Link>
        <span>/</span>
        <span style={{ color: "var(--eden-black)", fontWeight: 500 }}>
          New
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
          <h1 className="eden-page-title" style={{ margin: 0 }}>
            NEW PRODUCT
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6f7177", fontSize: "12.5px" }}>
            Add a formulation or accessory to the active catalog.
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

      <div
        style={{
          background: "var(--eden-surface)",
          border: "1px solid var(--eden-border)",
          padding: "clamp(24px, 4vw, 44px)",
          maxWidth: "840px",
        }}
      >
        {error && <div className="eden-error-notice">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="eden-form-grid" style={{ marginBottom: "32px" }}>
            <div className="eden-field-group">
              <label htmlFor="p-name" className="eden-field-label">
                Product Title
              </label>
              <input
                id="p-name"
                name="name"
                className="eden-underline-input"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Whey Protein Isolate"
                required
              />
            </div>

            <div className="eden-field-group">
              <label htmlFor="p-category" className="eden-field-label">
                Category
              </label>
              <input
                id="p-category"
                name="category"
                className="eden-underline-input"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Protein, Creatine, Vitamins"
              />
            </div>

            <div className="eden-field-group">
              <label htmlFor="p-price" className="eden-field-label">
                Retail Price (₹)
              </label>
              <input
                id="p-price"
                name="price"
                type="number"
                min="0"
                className="eden-underline-input"
                value={form.price}
                onChange={handleChange}
                placeholder="2499"
                required
              />
            </div>

            <div className="eden-field-group">
              <label htmlFor="p-stock" className="eden-field-label">
                Inventory Units
              </label>
              <input
                id="p-stock"
                name="stock"
                type="number"
                min="0"
                className="eden-underline-input"
                value={form.stock}
                onChange={handleChange}
                placeholder="50"
                required
              />
            </div>

            <div className="eden-field-group full-width">
              <label htmlFor="p-image" className="eden-field-label">
                Image Path or URL
              </label>
              <input
                id="p-image"
                name="image"
                className="eden-underline-input"
                value={form.image}
                onChange={handleChange}
                placeholder="/products/whey-protein.png"
              />
            </div>

            <div className="eden-field-group full-width">
              <label htmlFor="p-desc" className="eden-field-label">
                Formulation & Overview
              </label>
              <textarea
                id="p-desc"
                name="description"
                className="eden-underline-input"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe nutritional profile, key ingredients, and usage guidelines."
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <button type="submit" className="eden-btn-black" disabled={saving}>
              <span>{saving ? "SAVING..." : "SAVE PRODUCT"}</span>
              <ArrowRight size={13} />
            </button>
            <Link to="/admin/products" className="eden-btn-outline">
              CANCEL
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddProduct;
