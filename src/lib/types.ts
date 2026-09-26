export type EnquiryStatus = "new" | "reviewing" | "quoted" | "confirmed" | "closed";
export type PaymentStatus = "pending" | "paid" | "rejected";

export interface Talent { id: string; slug: string; name: string; discipline: string; location: string; bio: string; image: string; tags: string[]; featured: boolean; published: boolean; }
export interface Enquiry { id: string; reference: string; talent?: string; service?: string; eventType: string; eventDate: string; location: string; budget: string; name: string; email: string; phone?: string; company?: string; message?: string; status: EnquiryStatus; notes?: string; createdAt: string; }
export interface PaymentMethod { id: string; name: string; network: string; address: string; instructions?: string; qrCodeUrl?: string; enabled: boolean; order: number; }
export interface PaymentRequest { id: string; reference: string; bookingReference: string; amount: string; currency: string; status: "open" | "paid" | "cancelled"; description?: string; createdAt: string; }
export interface Payment { id: string; reference: string; bookingReference: string; amount: string; currency: string; methodId: string; transactionHash: string; proofUrl?: string; payerEmail: string; status: PaymentStatus; verificationNotes?: string; createdAt: string; updatedAt: string; history: { at: string; actor: string; action: string; note?: string }[]; }
export interface Conversation { id: string; visitorName?: string; visitorEmail?: string; status: "open" | "assigned" | "closed"; assignedTo?: string; unread: number; lastMessage: string; updatedAt: string; messages: { id: string; sender: "visitor" | "admin"; text: string; at: string }[]; }
export interface SiteContent { servicesIntro: string; foundationTitle: string; foundationBody: string; contactEmail: string; contactPhone: string; featuredHeading: string; faqs: { question: string; answer: string }[]; }
