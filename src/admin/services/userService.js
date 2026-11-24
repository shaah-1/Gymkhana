import { getSupabaseClient } from "../../services/supabase";
import { mapProfile, toProfileRow } from "../../services/supabaseMappers";

export async function getUsers() {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapProfile);
}

export async function updateUser(id, changes) {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .update(toProfileRow(changes))
    .eq("id", String(id))
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function saveAdminUser(changes) {
  const client = getSupabaseClient();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("Sign in again before updating your profile.");

  const { email, ...profileChanges } = changes;
  let emailChangeRequested = false;
  if (email && email.trim().toLowerCase() !== authData.user.email?.toLowerCase()) {
    const { error } = await client.auth.updateUser({
      email: email.trim().toLowerCase(),
    });
    if (error) throw error;
    emailChangeRequested = true;
  }
  if (Object.keys(profileChanges).length > 0) {
    const { error } = await client
      .from("profiles")
      .update(toProfileRow(profileChanges))
      .eq("id", authData.user.id);
    if (error) throw error;
  }
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();
  if (error) throw error;
  return {
    ...mapProfile(data),
    ...(emailChangeRequested ? { pendingEmail: email.trim().toLowerCase() } : {}),
  };
}
