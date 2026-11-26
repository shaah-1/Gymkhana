import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Trash2, Edit2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchAdminProducts,
  deleteAdminProduct,
} from "../store/slices/adminProductSlice";
import AdminPrice from "../components/AdminPrice";
import { publicAssetUrl } from "../../utils/publicAssetUrl";
import {
  adminBreadcrumbLinkClass,
  adminBreadcrumbsClass,
  adminBtnBlackClass,
  adminErrorNoticeClass,
  adminNumClass,
  adminPageHeaderClass,
  adminPageSubtitleClass,
  adminPageTitleClass,
  adminStatusTagClass,
  adminTableClass,
  adminTableContainerClass,
  adminTdClass,
  adminThClass,
  adminThumbBoxClass,
  adminTitleNumClass,
  adminUnderlineInputClass,
} from "../adminClasses";

const paginationBtnClass =
  "inline-flex h-[30px] cursor-pointer items-center gap-1 rounded-[2px] border border-[#e6e6e9] bg-white px-[10px] font-inherit text-[11px] font-medium tracking-[0.06em] text-[#121214] uppercase select-none transition-all duration-150 hover:not-disabled:border-[#121214] hover:not-disabled:bg-[#121214] hover:not-disabled:text-white disabled:cursor-not-allowed disabled:border-[#e6e6e9] disabled:bg-transparent disabled:text-[#a4a6ad] disabled:opacity-35";

function Products() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(
    (state) => state.adminProducts
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

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
    const name = (p.name || p.title || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    const matchesSearch = !q || name.includes(q) || category.includes(q);
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const pageCount = Math.ceil(filteredProducts.length / pageSize) || 1;
  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const firstVisibleProduct = filteredProducts.length
    ? (currentPage - 1) * pageSize + 1
    : 0;
  const lastVisibleProduct = Math.min(
    currentPage * pageSize,
    filteredProducts.length
  );

  return (
    <section>
      {/* Breadcrumbs */}
      <div className={adminBreadcrumbsClass}>
        <Link to="/admin" className={adminBreadcrumbLinkClass}>
          Administration
        </Link>
        <span className="text-[#3b3d42]">/</span>
        <span className="font-medium text-[#121214]">Products</span>
      </div>

      <div className={adminPageHeaderClass}>
        <div>
          <h1 className={adminPageTitleClass}>
            CATALOG <span className={adminTitleNumClass}>({products.length})</span>
          </h1>
          <p className={adminPageSubtitleClass}>
            Curate specifications, stock availability, and retail pricing.
          </p>
        </div>

        <Link to="/admin/products/add" className={adminBtnBlackClass}>
          <span>ADD PRODUCT</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Filter line */}
      <div className="mb-6 flex flex-wrap items-center gap-5 max-[640px]:mb-5 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3">
        <div className="w-full max-w-[340px] max-[640px]:max-w-full">
          <input
            type="search"
            className={adminUnderlineInputClass}
            placeholder="Filter by name or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="relative inline-flex items-center max-[640px]:w-full">
          <select
            id="admin-category-select"
            className="h-9 cursor-pointer appearance-none rounded-[2px] border border-[#e6e6e9] bg-white pr-[30px] pl-3 font-inherit text-[11.5px] font-medium tracking-[0.04em] text-[#121214] outline-none transition-colors duration-150 hover:border-[#121214] focus:border-[#121214] max-[640px]:w-full"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-[10px] text-[#76787e]"
          />
        </div>
      </div>

      {loading && products.length === 0 ? (
        <p className="text-[#7a7c82]">Loading catalog...</p>
      ) : error ? (
        <div className={adminErrorNoticeClass}>{error}</div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-[#7a7c82]">No products found matching your search.</p>
      ) : (
        <div className={adminTableContainerClass}>
          <table className={adminTableClass}>
            <thead>
              <tr>
                <th className={adminThClass}>Product</th>
                <th className={adminThClass}>Category</th>
                <th className={adminThClass}>Price</th>
                <th className={adminThClass}>Inventory Status</th>
                <th className={adminThClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageProducts.map((product) => {
                const stock = Number(product.stock ?? 0);
                const isOutOfStock = stock <= 0;
                const isLowStock = !isOutOfStock && stock <= 5;
                const statusKey = isOutOfStock
                  ? "cancelled"
                  : isLowStock
                    ? "pending"
                    : "delivered";

                return (
                  <tr key={product.id} className="group/row hover:bg-[#fafafc]">
                    <td className={adminTdClass}>
                      <div className="flex items-center gap-[14px]">
                        <div className={adminThumbBoxClass}>
                          <img
                            src={publicAssetUrl(
                              product.image || "/products/whey-protein.png"
                            )}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="font-semibold text-[#121214]">
                          {product.name || product.title}
                        </span>
                      </div>
                    </td>
                    <td className={adminTdClass}>{product.category || "—"}</td>
                    <td className={adminTdClass}>
                      <strong className={adminNumClass}>
                        <AdminPrice amount={product.price} />
                      </strong>
                    </td>
                    <td className={adminTdClass}>
                      <span className={adminStatusTagClass(statusKey)}>
                        {isOutOfStock ? (
                          "OUT OF STOCK"
                        ) : isLowStock ? (
                          <>
                            <strong className="inline-block min-w-max shrink-0 text-[10.5px] font-light tracking-[0.02em] text-inherit">
                              {stock}
                            </strong>{" "}
                            LOW STOCK
                          </>
                        ) : (
                          <>
                            <strong className="inline-block min-w-max shrink-0 text-[10.5px] font-light tracking-[0.02em] text-inherit">
                              {stock}
                            </strong>{" "}
                            IN STOCK
                          </>
                        )}
                      </span>
                    </td>
                    <td className={adminTdClass}>
                      <div className="flex items-center gap-[14px]">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.14em] text-[#121214] uppercase no-underline transition-opacity duration-150 hover:opacity-60 max-[640px]:min-h-8 max-[640px]:rounded-[2px] max-[640px]:px-[10px] max-[640px]:py-[6px]"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[11px] font-semibold tracking-[0.12em] text-[#8c4242] uppercase transition-opacity duration-150 hover:opacity-75 max-[640px]:min-h-8 max-[640px]:rounded-[2px] max-[640px]:px-[10px] max-[640px]:py-[6px]"
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
      {filteredProducts.length > 0 && !loading && !error && (
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#e6e6e9] pt-[18px] max-[640px]:flex-col max-[640px]:items-center max-[640px]:gap-3"
          aria-label="Pagination"
        >
          <span className="text-[11.5px] font-light tracking-[0.04em] text-[#76787e] tabular-nums">
            Showing {firstVisibleProduct}–{lastVisibleProduct} of {filteredProducts.length} products
          </span>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className={paginationBtnClass}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={13} />
              <span>Prev</span>
            </button>

            <span className="min-w-11 text-center text-xs font-light text-[#121214] tabular-nums">
              {currentPage} <span className="mx-[2px] font-light text-[#b8babc]">/</span> {pageCount}
            </span>

            <button
              type="button"
              className={paginationBtnClass}
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage >= pageCount}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Products;
