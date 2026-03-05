import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

export async function requireSuperadmin(): Promise<string> {
  const supabase = await supabaseServer();

  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (userErr || !user) {
    redirect("/login");
  }

  // Check profile superadmin flag
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (profErr || !profile?.is_superadmin) {
    redirect("/login");
  }

  // ✅ Return a STRING (safe to render)
  return user.email ?? user.id;
}