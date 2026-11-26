import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  fetchAdminProducts,
  updateAdminProduct,
} from "../store/slices/adminProductSlice";
import {
  adminBackLinkClass,
  adminBreadcrumbLinkClass,
  adminBreadcrumbsClass,
  adminBtnBlackClass,
  adminBtnOutlineClass,
  adminErrorNoticeClass,
  adminFieldLabelClass,
  adminFormContainerClass,
  adminPageHeaderClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
  adminUnderlineInputClass,
} from "../adminClasses";

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
    <div className={adminFormContainerClass}>
      {error && <div className={adminErrorNoticeClass}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-[22px] max-[900px]:grid-cols-1 max-[900px]:gap-5">
          <div className="flex flex-col">
            <label htmlFor="ep-name" className={adminFieldLabelClass}>
              Product Title
            </label>
            <input
              id="ep-name"
              name="name"
              className={adminUnderlineInputClass}
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="ep-category" className={adminFieldLabelClass}>
              Category
            </label>
            <input
              id="ep-category"
              name="category"
              className={adminUnderlineInputClass}
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="ep-price" className={adminFieldLabelClass}>
              Retail Price (₹)
            </label>
            <input
              id="ep-price"
              name="price"
              type="number"
              min="0"
              className={adminUnderlineInputClass}
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="ep-stock" className={adminFieldLabelClass}>
              Inventory Units
            </label>
            <input
              id="ep-stock"
              name="stock"
              type="number"
              min="0"
              className={adminUnderlineInputClass}
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-span-full flex flex-col">
            <label htmlFor="ep-image" className={adminFieldLabelClass}>
              Image Path or URL
            </label>
            <input
              id="ep-image"
              name="image"
              className={adminUnderlineInputClass}
              value={form.image}
              onChange={handleChange}
              placeholder="/products/example.png"
            />
          </div>

          <div className="col-span-full flex flex-col">
            <label htmlFor="ep-desc" className={adminFieldLabelClass}>
              Formulation &amp; Overview
            </label>
            <textarea
              id="ep-desc"
              name="description"
              className={`${adminUnderlineInputClass} resize-y`}
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3">
          <button type="submit" className={adminBtnBlackClass} disabled={saving}>
            <span>{saving ? "SAVING..." : "UPDATE PRODUCT"}</span>
            <ArrowRight size={13} />
          </button>
          <Link to="/admin/products" className={adminBtnOutlineClass}>
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
      <div className={adminBreadcrumbsClass}>
        <Link to="/admin" className={adminBreadcrumbLinkClass}>
          Administration
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <Link to="/admin/products" className={adminBreadcrumbLinkClass}>
          Products
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <span className="font-medium text-[#121214]">Edit</span>
      </div>

      <div className={adminPageHeaderClass}>
        <div>
          <h1 className={adminPageTitleClass}>EDIT PRODUCT</h1>
          <p className={adminPageSubtitleClass}>
            Modify retail price, inventory stock, or ingredient specifications.
          </p>
        </div>

        <Link to="/admin/products" className={adminBackLinkClass}>
          <ArrowLeft size={13} />
          <span>Catalog</span>
        </Link>
      </div>

      {!product ? (
        <p className="text-[#6f7177]">Loading product specifications...</p>
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
