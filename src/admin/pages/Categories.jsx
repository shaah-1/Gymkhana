import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard";
import "../../pages/shop/Shop.css";

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
    .then((items)=>{
        if (active)setProducts(Array.isArray(items)?items:[])
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
      const matchesSearch = !query ||
        `${product.name || product.title || ""} ${product.category || ""}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    if (sort === "price-low") result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-high") result.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "name") result.sort((a, b) => (a.name || a.title || "").localeCompare(b.name || b.title || ""));
    return result;
  }, [products, category, search, sort]);

  const clearFilters = () => {
    setCategory("all");
    setSort("default");
    setSearch("");
  };

  return (
    <main className="shop-page">
      <section className="shop-container">
        <div className="shop-heading">
          <p className="shop-eyebrow">GYMKHANA STORE</p>
          <h1>Categories</h1>
          <p>Browse products by category or find a specific item.</p>
        </div>

        <div className="shop-filters">
          <div className="shop-filter-item">
            <label htmlFor="shop-category-select">Category</label>
            <select id="shop-category-select" value={category} onChange={(event) => setCategory(event.target.value)} className="shop-filter-select">
              <option value="all">All categories</option>
              {availableCategories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="shop-filter-item">
            <label htmlFor="shop-sort-select">Sort</label>
            <select id="shop-sort-select" value={sort} onChange={(event) => setSort(event.target.value)} className="shop-filter-select">
              <option value="default">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="shop-filter-item">
            <label htmlFor="category-search">Search</label>
            <input id="category-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
          </div>
          {(search || category !== "all" || sort !== "default") && (
            <button type="button" onClick={clearFilters} className="shop-reset-btn">Reset filters</button>
          )}
        </div>

        {loading ? <p>Loading products…</p> : error ? <p role="alert">{error}</p> : visibleProducts.length ? (
          <div className="shop-product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : (
          <p>No products match these filters. <Link typeof="./shop">Browse all products</Link></p>
        )}
      </section>
    </main>
  );
}

export default Categories;
