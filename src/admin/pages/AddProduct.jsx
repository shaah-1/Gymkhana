import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { addAdminProduct } from "../store/slices/adminProductSlice";
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
      <div className={adminBreadcrumbsClass}>
        <Link to="/admin" className={adminBreadcrumbLinkClass}>
          Administration
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <Link to="/admin/products" className={adminBreadcrumbLinkClass}>
          Products
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <span className="font-medium text-[#121214]">New</span>
      </div>

      <div className={adminPageHeaderClass}>
        <div>
          <h1 className={adminPageTitleClass}>NEW PRODUCT</h1>
          <p className={adminPageSubtitleClass}>
            Add a formulation or accessory to the active catalog.
          </p>
        </div>

        <Link to="/admin/products" className={adminBackLinkClass}>
          <ArrowLeft size={13} />
          <span>Catalog</span>
        </Link>
      </div>

      <div className={adminFormContainerClass}>
        {error && <div className={adminErrorNoticeClass}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-[22px] max-[900px]:grid-cols-1 max-[900px]:gap-5">
            <div className="flex flex-col">
              <label htmlFor="p-name" className={adminFieldLabelClass}>
                Product Title
              </label>
              <input
                id="p-name"
                name="name"
                className={adminUnderlineInputClass}
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Whey Protein Isolate"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="p-category" className={adminFieldLabelClass}>
                Category
              </label>
              <input
                id="p-category"
                name="category"
                className={adminUnderlineInputClass}
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Protein, Creatine, Vitamins"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="p-price" className={adminFieldLabelClass}>
                Retail Price (₹)
              </label>
              <input
                id="p-price"
                name="price"
                type="number"
                min="0"
                className={adminUnderlineInputClass}
                value={form.price}
                onChange={handleChange}
                placeholder="2499"
                required
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="p-stock" className={adminFieldLabelClass}>
                Inventory Units
              </label>
              <input
                id="p-stock"
                name="stock"
                type="number"
                min="0"
                className={adminUnderlineInputClass}
                value={form.stock}
                onChange={handleChange}
                placeholder="50"
                required
              />
            </div>

            <div className="col-span-full flex flex-col">
              <label htmlFor="p-image" className={adminFieldLabelClass}>
                Image Path or URL
              </label>
              <input
                id="p-image"
                name="image"
                className={adminUnderlineInputClass}
                value={form.image}
                onChange={handleChange}
                placeholder="/products/whey-protein.png"
              />
            </div>

            <div className="col-span-full flex flex-col">
              <label htmlFor="p-desc" className={adminFieldLabelClass}>
                Formulation &amp; Overview
              </label>
              <textarea
                id="p-desc"
                name="description"
                className={`${adminUnderlineInputClass} resize-y`}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe nutritional profile, key ingredients, and usage guidelines."
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3">
            <button type="submit" className={adminBtnBlackClass} disabled={saving}>
              <span>{saving ? "SAVING..." : "SAVE PRODUCT"}</span>
              <ArrowRight size={13} />
            </button>
            <Link to="/admin/products" className={adminBtnOutlineClass}>
              CANCEL
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddProduct;
