import { AdminEnquiries } from "@/components/admin-enquiries"; import { listEnquiries } from "@/lib/db"; export default async function Page(){return <AdminEnquiries initial={await listEnquiries()}/>}
