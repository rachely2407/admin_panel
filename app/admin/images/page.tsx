import { requireSuperadmin } from "@/lib/requireSuperadmin";
import ImagesClient from "./ImagesClient";

export default async function ImagesPage() {
  const user = await requireSuperadmin(); // this is a string (email)
  return <ImagesClient authedEmail={user ?? ""} />;
}