import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing products."
  );
  process.exitCode = 1;
} else {
  const database = JSON.parse(await readFile(new URL("../db.json", import.meta.url), "utf8"));
  const products = database.products.map((product) => ({
    id: String(product.id),
    name: product.name,
    category: product.category || "",
    price: Number(product.price),
    stock: Number(product.stock ?? 0),
    image: product.image || "",
    description: product.description || "",
    detailed_description: product.detailedDescription || "",
    benefits: product.benefits || [],
    features: product.features || [],
    how_to_use: product.howToUse || "",
    additional_info: product.additionalInfo || "",
    sizes: product.sizes || [],
  }));
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { error } = await supabase
    .from("products")
    .upsert(products, { onConflict: "id" });

  if (error) {
    console.error(`Product import failed: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`Imported ${products.length} products into Supabase.`);
  }
}
