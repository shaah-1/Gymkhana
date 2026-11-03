import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CATALOG</p>
          <h2>Add Product</h2>
          <p>Create a new product listing in your catalog.</p>
        </div>
        <Link
          to="/admin/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#8e9198",
            fontSize: "12px",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to products</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {error && (
          <div
            className="admin-login-error-banner"
            style={{ gridColumn: "1 / -1" }}
          >
            {error}
          </div>
        )}

        <label>
          Product name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Whey Protein Isolate"
            required
          />
        </label>

        <label>
          Price (₹)
          <input
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 2499"
            required
          />
        </label>

        <label>
          Stock Quantity
          <input
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
            placeholder="e.g. 25"
            required
          />
        </label>

        <label>
          Category
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Protein, Creatine, Vitamins"
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Image URL or Path
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="e.g. /products/whey-protein.png"
          />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief product description for store listing"
            rows={3}
          />
        </label>

        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            gap: "14px",
            alignItems: "center",
          }}
        >
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save product"}
          </button>
          <Link
            to="/admin/products"
            style={{
              color: "#8e9198",
              fontSize: "12px",
              textDecoration: "none",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

export default AddProduct;
