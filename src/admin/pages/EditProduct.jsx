import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label>
        Price (₹)
        <input
          name="price"
          type="number"
          min="0"
          value={form.price}
          onChange={handleChange}
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
          required
        />
      </label>

      <label>
        Category
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
        />
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        Image URL or Path
        <input
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="/products/example.png"
        />
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
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
          {saving ? "Saving..." : "Save changes"}
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
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">CATALOG</p>
          <h2>Edit Product</h2>
          <p>Update product specifications, price, or inventory.</p>
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

      {!product ? (
        <p style={{ color: "#8e9198" }}>Loading product...</p>
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
