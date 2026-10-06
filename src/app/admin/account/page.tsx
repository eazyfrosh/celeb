import { redirect } from "next/navigation";
import { AdminAccount } from "@/components/admin-account";
import { getAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function Page() {
  const email = await getAdmin();
  if (!email) redirect("/admin/login?next=/admin/account");
  return <AdminAccount email={email} />;
}
