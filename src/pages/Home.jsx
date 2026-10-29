
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/productSlice";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const dispatch = useDispatch();

  const { items, loading, error } = useSelector(
    (state) => state.products
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get categories from products in JSON Server
 const categories = useMemo(() => [
  "All",
  ...new Set(
    items
      .map((product) => product.category)
      .filter(Boolean)
  ),
], [items]);

  // Search, filter, and sort products
  const filteredProducts = useMemo(() => {
    let result = items.filter((product) => {
      const matchesSearch = `${product.name} ${
        product.description || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low-high") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "high-low") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [items, search, category, sort]);

  return (
    <main>
      <section className="hero" id="home">
        <p className="eyebrow">WELCOME TO</p>
        <h1 className="hero-brand">GYMKHANA</h1>
        <p className="hero-tagline">
          FUEL YOUR AMBITION. BUILD YOUR LEGACY.
        </p>
        <p>
          Premium sports nutrition and gym essentials for your
          next level.
        </p>

        <a href="#products" className="hero-button">
          Explore Collection →
        </a>
      </section>

      <section id="products" className="products-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COLLECTION</p>
            <h2>Fuel your ambition.</h2>
          </div>

          <span>{filteredProducts.length} products</span>
        </div>

        <div className="product-controls">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="product-search"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="product-filter"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="product-filter"
          >
            <option value="default">Default Order</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {loading && <p>Loading products...</p>}

        {error && (
          <p className="error-message">
            {error}. Check whether JSON Server is running on port 3000.
          </p>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="no-products">
            No products found. Try another search or category.
          </p>
        )}

        {!loading && !error && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
