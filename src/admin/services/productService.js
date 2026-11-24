import { getSupabaseClient } from "../../services/supabase";
import {
  mapProduct,
  toProductRow,
} from "../../services/supabaseMappers";

export async function getProducts() {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function addProduct(product) {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .insert(toProductRow(product))
    .select("*")
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(id, changes) {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .update(toProductRow(changes))
    .eq("id", String(id))
    .select("*")
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProduct(id) {
  const { error } = await getSupabaseClient()
    .from("products")
    .delete()
    .eq("id", String(id));
  if (error) throw error;
  return String(id);
}
