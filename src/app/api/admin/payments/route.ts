import { NextResponse } from "next/server"; import { listPayments } from "@/lib/db"; export async function GET(){return NextResponse.json(await listPayments())}
