import { requireSuperadmin } from "@/lib/requireSuperadmin";
import ImagesClient from "./ImagesClient";

export default async function ImagesPage() {
  const user = await requireSuperadmin();

  return <ImagesClient authedEmail={user.email ?? ""} />;
}