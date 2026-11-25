import { getSupabaseClient } from "./supabase";
import { mapCartItem } from "./supabaseMappers";

export async function getCart(userId, signal) {
  let query = getSupabaseClient()
    .from("carts")
    .select("*")
    .eq("user_id", String(userId))
    .order("created_at", { ascending: true });
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapCartItem);
}

export async function addCartItem(item) {
  const row = {
    user_id: String(item.userId),
    product_id: String(item.productId),
    name: item.name,
    category: item.category || "",
    price: Number(item.price),
    image: item.image || "",
    stock: Number(item.stock ?? 0),
    quantity: Number(item.quantity),
  };
  const { data, error } = await getSupabaseClient()
    .from("carts")
    .upsert(row, { onConflict: "user_id,product_id" })
    .select("*")
    .single();
  if (error) throw error;
  return mapCartItem(data);
}

export async function updateCartItem(id, updates) {
  const { data, error } = await getSupabaseClient()
    .from("carts")
    .update({ quantity: Number(updates.quantity) })
    .eq("id", String(id))
    .select("*")
    .single();
  if (error) throw error;
  return mapCartItem(data);
}

export async function deleteCartItem(id) {
  const { error } = await getSupabaseClient()
    .from("carts")
    .delete()
    .eq("id", String(id));
  if (error) throw error;
  return id;
}
