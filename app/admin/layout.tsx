import Link from "next/link";
import { requireSuperadmin } from "@/lib/requireSuperadmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await requireSuperadmin(); // ✅ string

  return (
    <div className="card">
      <div className="nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="pill">✨ future-cute admin</span>
          <span className="pill">
            <span className="ok">●</span> {email}
          </span>
        </div>

        <div className="navLinks">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/images">Images</Link>
          <Link href="/admin/captions">Captions</Link>
        </div>
      </div>

      <div className="cardPad">{children}</div>
    </div>
  );
}