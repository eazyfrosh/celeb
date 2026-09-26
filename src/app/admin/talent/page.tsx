import { AdminTalent } from "@/components/admin-talent"; import { listTalents } from "@/lib/db"; export default async function Page(){return <AdminTalent initial={await listTalents(true)}/>}
