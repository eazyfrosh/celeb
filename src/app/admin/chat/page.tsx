import { AdminChat } from "@/components/admin-chat"; import { listConversations } from "@/lib/db";export default async function Page(){return <AdminChat initial={await listConversations()}/>}
