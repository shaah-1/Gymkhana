import { getSupabaseClient } from "./supabase";
import { mapWishlistItem } from "./supabaseMappers";

export async function getWishlist(userId) {
  const { data, error } = await getSupabaseClient()
    .from("wishlists")
    .select("*")
    .eq("user_id", String(userId))
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapWishlistItem);
}

export async function addWishlistItem(item) {
  const row = {
    user_id: String(item.userId),
    product_id: String(item.productId),
    name: item.name,
    category: item.category || "",
    price: Number(item.price) || 0,
    image: item.image || "",
    stock: Number(item.stock ?? 0),
  };
  const { data, error } = await getSupabaseClient()
    .from("wishlists")
    .upsert(row, { onConflict: "user_id,product_id" })
    .select("*")
    .single();
  if (error) throw error;
  return mapWishlistItem(data);
}

export async function deleteWishlistItem(id) {
  const { error } = await getSupabaseClient()
    .from("wishlists")
    .delete()
    .eq("id", String(id));
  if (error) throw error;
  return id;
}
