import { getSupabaseClient } from "./supabase";
import { mapProduct, toProductRow } from "./supabaseMappers";

export async function getProducts() {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function getProductById(id) {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .eq("id", String(id))
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const notFound = new Error("Product not found");
    notFound.status = 404;
    throw notFound;
  }
  return mapProduct(data);
}

export async function getProductSales() {
  const { data, error } = await getSupabaseClient().rpc("get_product_sales");
  if (error) throw error;
  return data;
}

export { mapProduct, toProductRow };
