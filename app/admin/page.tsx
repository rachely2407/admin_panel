import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function count(table: string) {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) return { value: null, error: error.message };
  return { value: count ?? 0, error: null };
}

export default async function AdminHome() {
  const [usersC, imagesC, captionsC] = await Promise.all([
    count("profiles"),
    count("images"),
    count("captions"),
  ]);

  // Top images by caption count
  // We do this by pulling captions(image_id) and counting in JS (simple + reliable)
  const { data: capRows } = await supabaseAdmin
    .from("captions")
    .select("image_id, like_count, is_public, humor_flavor_id")
    .limit(2000);

  const caps = (capRows ?? []) as any[];

  const captionCountByImage = new Map<string, number>();
  let totalLikes = 0;
  let publicCount = 0;
  const humorCounts = new Map<number, number>();

  for (const c of caps) {
    const imgId = String(c.image_id);
    captionCountByImage.set(imgId, (captionCountByImage.get(imgId) ?? 0) + 1);

    const like = Number(c.like_count ?? 0);
    totalLikes += like;

    if (c.is_public === true) publicCount += 1;

    const hf = c.humor_flavor_id;
    if (typeof hf === "number") humorCounts.set(hf, (humorCounts.get(hf) ?? 0) + 1);
  }

  const avgLikes = caps.length ? (totalLikes / caps.length).toFixed(2) : "0.00";
  const publicPct = caps.length ? ((publicCount / caps.length) * 100).toFixed(1) : "0.0";

  const topImages = Array.from(captionCountByImage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const humorTop = Array.from(humorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Fetch URLs for those top images so we can preview
  const topImageIds = topImages.map(([id]) => id);
  const { data: imgRows } = await supabaseAdmin
    .from("images")
    .select("id, url")
    .in("id", topImageIds);

  const imgUrlById = new Map<string, string>();
  (imgRows ?? []).forEach((r: any) => imgUrlById.set(String(r.id), String(r.url)));

  return (
    <main>
      <h1 className="h1">Dashboard</h1>
      <div className="h2">Cute, clean, and actually useful.</div>

      <div className="grid3" style={{ marginTop: 12 }}>
        <div className="card cardPad">
          <div className="h2">Users</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {usersC.value ?? "—"}
          </div>
          {usersC.error && <div className="err">{usersC.error}</div>}
        </div>

        <div className="card cardPad">
          <div className="h2">Images</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {imagesC.value ?? "—"}
          </div>
          {imagesC.error && <div className="err">{imagesC.error}</div>}
        </div>

        <div className="card cardPad">
          <div className="h2">Captions</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {captionsC.value ?? "—"}
          </div>
          {captionsC.error && <div className="err">{captionsC.error}</div>}
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card cardPad">
          <div className="h2">Engagement</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span className="pill">Avg likes/caption: <b>{avgLikes}</b></span>
            <span className="pill">Public captions: <b>{publicPct}%</b></span>
            <span className="pill">Sampled captions: <b>{caps.length}</b></span>
          </div>
        </div>

        <div className="card cardPad">
          <div className="h2">Top humor flavors (sample)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {humorTop.length === 0 ? (
              <span className="pill">No data</span>
            ) : (
              humorTop.map(([hf, n]) => (
                <span key={hf} className="pill">
                  flavor <b>{hf}</b>: {n}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card cardPad" style={{ marginTop: 12 }}>
        <div className="h2">Top images by caption count (sample)</div>

        <table className="table" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>preview</th>
              <th>image_id</th>
              <th>caption_count</th>
            </tr>
          </thead>
          <tbody>
            {topImages.map(([id, n]) => (
              <tr key={id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrlById.get(id) || ""}
                    alt=""
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                </td>
                <td className="mono">{id}</td>
                <td><b>{n}</b></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 10 }} className="pill">
          Note: Stats are computed from a capped sample (up to 2000 captions) for speed.
        </div>
      </div>
    </main>
  );
}