import { getSupabaseClient } from "./supabase";
import { mapProfile, toProfileRow } from "./supabaseMappers";

export async function registerUser({ name, email, password }) {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { name: name.trim() } },
  });
  if (error) throw error;
  return data;
}

export async function loginUser(email, password) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;

  const profile = await getUserById(data.user.id);
  if (profile.blocked) {
    await client.auth.signOut();
    throw new Error("Your account has been suspended. Please contact support.");
  }
  return { ...profile, email: data.user.email };
}

export async function getCurrentProfile(userId) {
  return getUserById(userId);
}

export async function signOutUser() {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email) {
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/update-password` }
  );
  if (error) throw error;
}

export async function saveRecoveredPassword(password) {
  const { error } = await getSupabaseClient().auth.updateUser({ password });
  if (error) throw error;
}

export async function getUserById(id) {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("*")
    .eq("id", String(id))
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updateUserById(id, changes) {
  const client = getSupabaseClient();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user || authData.user.id !== String(id)) {
    throw new Error("You can only update your own account profile.");
  }

  const { email, ...profileChanges } = changes;
  if (email && email.trim().toLowerCase() !== authData.user.email?.toLowerCase()) {
    const { error } = await client.auth.updateUser({
      email: email.trim().toLowerCase(),
    });
    if (error) throw error;
  }

  if (Object.keys(profileChanges).length > 0) {
    const { error } = await client
      .from("profiles")
      .update(toProfileRow(profileChanges))
      .eq("id", String(id));
    if (error) throw error;
  }

  return getUserById(id);
}

export async function updatePassword(currentPassword, newPassword) {
  const client = getSupabaseClient();
  const { data, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!data.user?.email) throw new Error("Sign in again before changing your password.");

  const { error: verifyError } = await client.auth.signInWithPassword({
    email: data.user.email,
    password: currentPassword,
  });
  if (verifyError) throw verifyError;

  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
