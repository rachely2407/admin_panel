import { requireSuperadmin } from "@/lib/requireSuperadmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function UsersPage() {
  await requireSuperadmin();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, is_superadmin")
    .limit(200);

  return (
    <main style={{ padding: 24 }}>
      <h1>Users / Profiles</h1>

      {error && <p style={{ color: "crimson" }}>Error: {error.message}</p>}

      <table border={1} cellPadding={8} style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>id</th>
            <th>email</th>
            <th>is_superadmin</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((u) => (
            <tr key={u.id}>
              <td style={{ fontFamily: "monospace" }}>{u.id}</td>
              <td>{u.email}</td>
              <td>{String(u.is_superadmin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}