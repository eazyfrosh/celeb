import { NextResponse } from "next/server"; import { listEnquiries } from "@/lib/db"; export async function GET(){return NextResponse.json(await listEnquiries())}
