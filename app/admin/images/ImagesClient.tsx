"use client";

import { useEffect, useState } from "react";

type ImageRow = {
  id: string;
  url: string;
  image_description: string | null;
};

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg =
      json?.error ||
      json?.message ||
      text ||
      `Request failed with ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return json;
}

export default function ImagesClient({ authedEmail }: { authedEmail: string }) {
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const data = await fetchJson("/api/admin/images");
      setRows(data.rows || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createImage() {
    setErr(null);
    try {
      await fetchJson("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, image_description: desc }),
      });
      setUrl("");
      setDesc("");
      await load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function deleteImage(id: string) {
    setErr(null);
    setBusyId(id);
    try {
      await fetchJson(`/api/admin/images/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function saveImage(row: ImageRow) {
    setErr(null);
    setBusyId(row.id);
    try {
      await fetchJson(`/api/admin/images/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: row.url,
          image_description: row.image_description,
        }),
      });
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading images...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Images</h1>
      <p>Logged in as {authedEmail}</p>

      {err ? (
        <div
          style={{
            padding: 12,
            border: "1px solid rgba(255,0,0,0.35)",
            background: "rgba(255,0,0,0.08)",
            borderRadius: 10,
            marginBottom: 16,
            maxWidth: 900,
          }}
        >
          <b>Error:</b> {err}
        </div>
      ) : null}

      <h3>Create Image</h3>

      <input
        placeholder="Image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: 420, marginRight: 10 }}
      />

      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        style={{ width: 420, marginRight: 10 }}
      />

      <button onClick={createImage}>Create</button>

      <hr style={{ margin: "30px 0" }} />

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>preview</th>
            <th>url</th>
            <th>description</th>
            <th>actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <img
                  src={row.url}
                  width={80}
                  style={{ borderRadius: 8, objectFit: "cover" }}
                />
              </td>

              <td>
                <input
                  value={row.url}
                  onChange={(e) => {
                    setRows((prev) =>
                      prev.map((x) =>
                        x.id === row.id ? { ...x, url: e.target.value } : x
                      )
                    );
                  }}
                  style={{ width: 320 }}
                />
              </td>

              <td>
                <input
                  value={row.image_description || ""}
                  onChange={(e) => {
                    setRows((prev) =>
                      prev.map((x) =>
                        x.id === row.id
                          ? { ...x, image_description: e.target.value }
                          : x
                      )
                    );
                  }}
                  style={{ width: 320 }}
                />
              </td>

              <td>
                <button
                  onClick={() => saveImage(row)}
                  disabled={busyId === row.id}
                >
                  {busyId === row.id ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => deleteImage(row.id)}
                  disabled={busyId === row.id}
                  style={{ marginLeft: 10 }}
                >
                  {busyId === row.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}