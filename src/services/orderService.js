import { getSupabaseClient } from "./supabase";
import { mapOrder } from "./supabaseMappers";

export async function getOrdersByUserId(userId) {
  const { data, error } = await getSupabaseClient()
    .from("orders")
    .select("*")
    .eq("user_id", String(userId))
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapOrder);
}

export async function getAllOrders() {
  const { data, error } = await getSupabaseClient()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapOrder);
}

export async function createOrder(order) {
  const { data, error } = await getSupabaseClient().rpc("place_order", {
    p_customer: order.customer,
    p_items: order.items.map((item) => ({
      productId: String(item.productId || item.id),
      quantity: Number(item.quantity),
    })),
    p_payment_method: order.paymentMethod,
  });
  if (error) throw error;
  return mapOrder(data);
}

export async function updateOrder(id, changes) {
  const update = {};
  if (changes.status !== undefined) update.status = changes.status;
  if (changes.paymentStatus !== undefined) {
    update.payment_status = changes.paymentStatus;
  }
  const { data, error } = await getSupabaseClient()
    .from("orders")
    .update(update)
    .eq("id", String(id))
    .select("*")
    .single();
  if (error) throw error;
  return mapOrder(data);
}
