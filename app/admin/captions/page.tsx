import { requireSuperadmin } from "@/lib/requireSuperadmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function CaptionsPage() {
  await requireSuperadmin();

  const { data, error } = await supabaseAdmin
    .from("captions")
    .select(
      "id, created_datetime_utc, modified_datetime_utc, content, is_public, profile_id, image_id, like_count"
    )
    .limit(200);

  return (
    <main style={{ padding: 24 }}>
      <h1>Captions</h1>

      {error && <p style={{ color: "crimson" }}>Error: {error.message}</p>}

      <table border={1} cellPadding={8} style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>id</th>
            <th>image_id</th>
            <th>profile_id</th>
            <th>is_public</th>
            <th>like_count</th>
            <th>created_datetime_utc</th>
            <th>content</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((c: any) => (
            <tr key={c.id}>
              <td style={{ fontFamily: "monospace" }}>{c.id}</td>
              <td>{c.image_id}</td>
              <td style={{ fontFamily: "monospace" }}>{c.profile_id}</td>
              <td>{String(c.is_public)}</td>
              <td>{c.like_count}</td>
              <td>{c.created_datetime_utc}</td>
              <td>{c.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}