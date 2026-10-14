"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/";

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    redirect(`/login?error=${encodeURIComponent(error.message || "Login failed")}`);
  }

  const data = await res.json().catch(() => ({}));
  if (data.requireOtp) {
    redirect(`/login?otpRequired=true&email=${encodeURIComponent(email)}`);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    redirect(`/register?error=${encodeURIComponent(error.message || "Registration failed")}`);
  }

  revalidatePath("/", "layout");
  redirect("/login?verifyRequired=true");
}

export async function logout() {
  revalidatePath("/", "layout");
  redirect("/");
}
