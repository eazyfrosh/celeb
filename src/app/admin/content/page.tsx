import { AdminContent } from "@/components/admin-content"; import { getContent } from "@/lib/db"; export default async function Page(){return <AdminContent initial={await getContent()}/>}
