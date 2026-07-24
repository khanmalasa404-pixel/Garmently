"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return null;
  }

  if (!email.trim() || password.length < 6) {
    return null;
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

export async function login(formData: FormData) {
  const credentials = getCredentials(formData);

  if (!credentials) {
    redirect(
      "/login?error=Enter a valid email and a password with at least 6 characters.",
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const credentials = getCredentials(formData);

  if (!credentials) {
    redirect(
      "/login?error=Enter a valid email and a password with at least 6 characters.",
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");

  if (!data.session) {
    redirect(
      "/login?message=Account created. Check your email to confirm your account.",
    );
  }

  redirect("/dashboard");
}