import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard";

const controlFieldClass =
  "flex flex-col gap-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-[#71737d] uppercase";

const selectClass =
  "h-9 cursor-pointer rounded-none border border-[#d5d7dc] bg-white px-3 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-xs font-medium text-[#121214] outline-none transition-colors duration-150 focus:border-[#121214]";

function Categories() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getProducts()
      .then((items) => {
        if (active) setProducts(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (active) setError("Products could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const availableCategories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products]
  );

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesSearch =
        !query ||
        `${product.name || product.title || ""} ${product.category || ""}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });

    if (sort === "price-low") result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-high") result.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "name")
      result.sort((a, b) =>
        (a.name || a.title || "").localeCompare(b.name || b.title || "")
      );
    return result;
  }, [products, category, search, sort]);

  const clearFilters = () => {
    setCategory("all");
    setSort("default");
    setSearch("");
  };

  return (
    <main className="mx-auto box-border w-full max-w-[1360px] bg-white px-[clamp(20px,4vw,64px)] pt-[clamp(48px,6vw,88px)] pb-24 text-[#121214]">
      <section className="mx-auto max-w-[1200px]">
        <div className="mb-10 border-b border-[#ebebef] pb-6">
          <p className="m-0 mb-2 text-[10.5px] font-bold tracking-[0.22em] text-[#8b8e96] uppercase">
            GYMKHANA STORE
          </p>
          <h1 className="m-0 mb-2 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(28px,3.6vw,42px)] font-medium tracking-[0.04em] text-[#121214] uppercase">
            Categories
          </h1>
          <p className="m-0 text-sm text-[#55575e]">
            Browse products by category or find a specific item.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap items-end gap-4 border-b border-[#ededf0] pb-6">
          <div className={controlFieldClass}>
            <label htmlFor="shop-category-select">Category</label>
            <select
              id="shop-category-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={selectClass}
            >
              <option value="all">All categories</option>
              {availableCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className={controlFieldClass}>
            <label htmlFor="shop-sort-select">Sort</label>
            <select
              id="shop-sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={selectClass}
            >
              <option value="default">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className={controlFieldClass}>
            <label htmlFor="category-search">Search</label>
            <input
              id="category-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="h-9 rounded-none border border-[#d5d7dc] bg-white px-3 text-xs text-[#121214] outline-none transition-colors duration-150 focus:border-[#121214]"
            />
          </div>
          {(search || category !== "all" || sort !== "default") && (
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer border-0 border-b-[1.5px] border-[#121214] bg-transparent px-0 py-1 text-[10.5px] font-bold tracking-[0.14em] text-[#121214] uppercase transition-opacity duration-150 hover:opacity-60"
            >
              Reset filters
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-[#71737d]">Loading products…</p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-[#b91c1c]" role="alert">
            {error}
          </p>
        ) : visibleProducts.length ? (
          <div className="grid grid-cols-4 items-stretch gap-[clamp(14px,1.8vw,24px)] max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[360px]:grid-cols-1">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-[#55575e]">
            No products match these filters.{" "}
            <Link to="/shop" className="font-semibold text-[#121214] underline underline-offset-4">
              Browse all products
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}

export default Categories;
