import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { defaultContent, sampleTalents } from "./data";
import type { Conversation, Enquiry, Payment, PaymentMethod, PaymentRequest, SiteContent, Talent } from "./types";

type Memory = { talents: Talent[]; enquiries: Enquiry[]; paymentMethods: PaymentMethod[]; paymentRequests: PaymentRequest[]; payments: Payment[]; conversations: Conversation[]; content: SiteContent; admins: { email: string; passwordHash: string }[] };
const globalStore = globalThis as unknown as { velaire?: Memory };
const memory = globalStore.velaire ||= {
  talents: structuredClone(sampleTalents), enquiries: [], payments: [], conversations: [], content: structuredClone(defaultContent), admins: [], paymentRequests: [
    { id: "demo-request", reference: "INV-DEMO-001", bookingReference: "VQ-DEMO", amount: "15000.00", currency: "USD", status: "open", description: "Sample appearance deposit", createdAt: new Date().toISOString() },
  ],
  paymentMethods: [
    { id: "btc", name: "Bitcoin", network: "Bitcoin", address: "bc1q-sample-address-not-for-payment", instructions: "Send only BTC on the Bitcoin network.", enabled: true, order: 1 },
    { id: "usdt", name: "USDT", network: "TRON (TRC20)", address: "T-sample-address-not-for-payment", instructions: "Send only USDT using TRC20.", enabled: true, order: 2 },
  ],
};

function firestore() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  if (!getApps().length) initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return getFirestore();
}

export const usingPersistentDb = () => Boolean(firestore());
const now = () => new Date().toISOString();

export async function listTalents(includeUnpublished = false) { const db = firestore(); if (!db) return memory.talents.filter(t => includeUnpublished || t.published); const snap = await db.collection("talents").get(); const rows = snap.docs.map(d => ({ id: d.id, ...d.data() } as Talent)); return rows.filter(t => includeUnpublished || t.published); }
export async function getTalentBySlug(slug: string) { return (await listTalents()).find(t => t.slug === slug) || null; }
export async function saveTalent(input: Talent) { const db = firestore(); if (!db) { const i = memory.talents.findIndex(t => t.id === input.id); if (i >= 0) memory.talents[i] = input; else memory.talents.push(input); return input; } await db.collection("talents").doc(input.id).set(input); return input; }
export async function removeTalent(id: string) { const db = firestore(); if (!db) { memory.talents = memory.talents.filter(t => t.id !== id); return; } await db.collection("talents").doc(id).delete(); }

export async function createEnquiry(input: Omit<Enquiry, "id" | "reference" | "status" | "createdAt">) { const row: Enquiry = { ...input, id: crypto.randomUUID(), reference: `VQ-${Date.now().toString(36).toUpperCase()}`, status: "new", createdAt: now() }; const db = firestore(); if (!db) memory.enquiries.unshift(row); else await db.collection("enquiries").doc(row.id).set(row); return row; }
export async function listEnquiries() { const db = firestore(); if (!db) return memory.enquiries; const snap = await db.collection("enquiries").orderBy("createdAt", "desc").get(); return snap.docs.map(d => ({ id: d.id, ...d.data() } as Enquiry)); }
export async function updateEnquiry(id: string, patch: Partial<Enquiry>) { const db = firestore(); if (!db) { const row = memory.enquiries.find(e => e.id === id); if (row) Object.assign(row, patch); return row; } await db.collection("enquiries").doc(id).update(patch); const doc = await db.collection("enquiries").doc(id).get(); return { id: doc.id, ...doc.data() } as Enquiry; }

export async function getContent() { const db = firestore(); if (!db) return memory.content; const doc = await db.collection("content").doc("site").get(); return doc.exists ? ({ ...defaultContent, ...doc.data() } as SiteContent) : defaultContent; }
export async function saveContent(content: SiteContent) { const db = firestore(); if (!db) memory.content = content; else await db.collection("content").doc("site").set(content); return content; }

export async function listPaymentMethods(enabledOnly = false) { const db = firestore(); let rows: PaymentMethod[]; if (!db) rows = memory.paymentMethods; else { const snap = await db.collection("paymentMethods").get(); rows = snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentMethod)); } return rows.filter(m => !enabledOnly || m.enabled).sort((a, b) => a.order - b.order); }
export async function savePaymentMethod(row: PaymentMethod) { const db = firestore(); if (!db) { const i = memory.paymentMethods.findIndex(m => m.id === row.id); if (i >= 0) memory.paymentMethods[i] = row; else memory.paymentMethods.push(row); } else await db.collection("paymentMethods").doc(row.id).set(row); return row; }
export async function removePaymentMethod(id: string) { const db = firestore(); if (!db) memory.paymentMethods = memory.paymentMethods.filter(m => m.id !== id); else await db.collection("paymentMethods").doc(id).delete(); }

export async function listPaymentRequests() { const db = firestore(); if (!db) return memory.paymentRequests; const snap = await db.collection("paymentRequests").orderBy("createdAt", "desc").get(); return snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRequest)); }
export async function getPaymentRequest(reference: string) { return (await listPaymentRequests()).find(r => r.reference.toLowerCase() === reference.toLowerCase()) || null; }
export async function createPaymentRequest(input: Omit<PaymentRequest, "id" | "createdAt" | "status">) { if (await getPaymentRequest(input.reference)) throw new Error("DUPLICATE_REFERENCE"); const row: PaymentRequest = { ...input, id: crypto.randomUUID(), status: "open", createdAt: now() }; const db = firestore(); if (!db) memory.paymentRequests.unshift(row); else await db.collection("paymentRequests").doc(row.id).set(row); return row; }
async function setPaymentRequestStatus(reference: string, status: PaymentRequest["status"]) { const row = await getPaymentRequest(reference); if (!row) return; const db = firestore(); if (!db) row.status = status; else await db.collection("paymentRequests").doc(row.id).update({ status }); }

export async function createPayment(input: Omit<Payment, "id" | "status" | "createdAt" | "updatedAt" | "history">) { const db = firestore(); const existing = await listPayments(); if (existing.some(p => p.transactionHash.toLowerCase() === input.transactionHash.toLowerCase())) throw new Error("DUPLICATE_HASH"); const at = now(); const row: Payment = { ...input, id: crypto.randomUUID(), status: "pending", createdAt: at, updatedAt: at, history: [{ at, actor: input.payerEmail, action: "Submitted for verification" }] }; if (!db) memory.payments.unshift(row); else await db.collection("payments").doc(row.id).set(row); return row; }
export async function listPayments() { const db = firestore(); if (!db) return memory.payments; const snap = await db.collection("payments").orderBy("createdAt", "desc").get(); return snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)); }
export async function updatePayment(id: string, status: Payment["status"], note: string, actor: string) { const rows = await listPayments(); const current = rows.find(p => p.id === id); if (!current) return null; const patch = { status, verificationNotes: note, updatedAt: now(), history: [...current.history, { at: now(), actor, action: `Marked ${status}`, note }] }; const db = firestore(); if (!db) Object.assign(current, patch); else await db.collection("payments").doc(id).update(patch); if (status === "paid") await setPaymentRequestStatus(current.reference, "paid"); return { ...current, ...patch }; }

export async function getConversation(id: string) { const db = firestore(); if (!db) return memory.conversations.find(c => c.id === id) || null; const doc = await db.collection("conversations").doc(id).get(); return doc.exists ? ({ id: doc.id, ...doc.data() } as Conversation) : null; }
export async function listConversations() { const db = firestore(); if (!db) return memory.conversations.sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)); const snap = await db.collection("conversations").orderBy("updatedAt", "desc").get(); return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation)); }
export async function addMessage(id: string | undefined, sender: "visitor" | "admin", text: string, contact?: { name?: string; email?: string }) { let row = id ? await getConversation(id) : null; const message = { id: crypto.randomUUID(), sender, text, at: now() }; if (!row) row = { id: crypto.randomUUID(), visitorName: contact?.name, visitorEmail: contact?.email, status: "open", unread: sender === "visitor" ? 1 : 0, lastMessage: text, updatedAt: now(), messages: [message] }; else row = { ...row, visitorName: contact?.name || row.visitorName, visitorEmail: contact?.email || row.visitorEmail, unread: sender === "visitor" ? row.unread + 1 : row.unread, lastMessage: text, updatedAt: now(), messages: [...row.messages, message] }; const db = firestore(); if (!db) { const i = memory.conversations.findIndex(c => c.id === row!.id); if (i >= 0) memory.conversations[i] = row; else memory.conversations.unshift(row); } else await db.collection("conversations").doc(row.id).set(row); return row; }
export async function updateConversation(id: string, patch: Partial<Conversation>) { const row = await getConversation(id); if (!row) return null; const next = { ...row, ...patch, updatedAt: now() }; const db = firestore(); if (!db) memory.conversations[memory.conversations.findIndex(c => c.id === id)] = next; else await db.collection("conversations").doc(id).set(next); return next; }

export async function findAdmin(email: string) { const db = firestore(); if (!db) return memory.admins.find(a => a.email === email) || null; const doc = await db.collection("admins").doc(email.toLowerCase()).get(); return doc.exists ? doc.data() as { email: string; passwordHash: string } : null; }
export async function saveAdmin(email: string, passwordHash: string) { const row = { email: email.toLowerCase(), passwordHash }; const db = firestore(); if (!db) { memory.admins = memory.admins.filter(a => a.email !== row.email); memory.admins.push(row); } else await db.collection("admins").doc(row.email).set(row); return row; }
