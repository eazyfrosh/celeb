import type { SiteContent, Talent } from "./types";

export const services = [
  { slug: "appearances", title: "Personal appearances", eyebrow: "Presence with purpose", description: "Carefully planned public and private appearances, from premieres to intimate celebrations.", number: "01" },
  { slug: "meet-greets", title: "Meet & greets", eyebrow: "Closer connections", description: "Thoughtful fan experiences designed around safety, access, photography and a smooth guest journey.", number: "02" },
  { slug: "autograph-events", title: "Autograph events", eyebrow: "Memorable moments", description: "End-to-end signing events, including venue, guest flow, inventory timing and talent requirements.", number: "03" },
  { slug: "corporate-events", title: "Corporate events", eyebrow: "A room transformed", description: "Hosts, speakers and performers matched to conferences, galas, launches and leadership gatherings.", number: "04" },
  { slug: "endorsements", title: "Endorsements", eyebrow: "Credible influence", description: "Talent partnerships built on audience fit, clear deliverables and responsible brand alignment.", number: "05" },
  { slug: "brand-partnerships", title: "Brand partnerships", eyebrow: "Longer stories", description: "Strategic collaborations spanning campaigns, content, ambassadorships and cultural moments.", number: "06" },
];

export const sampleTalents: Talent[] = [
  { id: "t1", slug: "amara-reed", name: "Amara Reed", discipline: "Actor & advocate", location: "London · Los Angeles", bio: "Award-winning screen performer and education advocate known for emotionally precise storytelling.", image: "/talent-amara.svg", tags: ["Appearances", "Speaking", "Campaigns"], featured: true, published: true },
  { id: "t2", slug: "kai-morrow", name: "Kai Morrow", discipline: "Recording artist", location: "New York", bio: "Genre-blending recording artist with a global audience and a distinctive live presence.", image: "/talent-kai.svg", tags: ["Performance", "Meet & greet", "Brand"], featured: true, published: true },
  { id: "t3", slug: "lena-park", name: "Lena Park", discipline: "Athlete & broadcaster", location: "Toronto", bio: "Championship athlete, trusted broadcaster and outspoken champion of access to sport.", image: "/talent-lena.svg", tags: ["Speaking", "Appearances", "Social"], featured: true, published: true },
  { id: "t4", slug: "niko-santos", name: "Niko Santos", discipline: "Chef & author", location: "Madrid · Miami", bio: "Celebrated chef and author creating joyful experiences around food, family and place.", image: "/talent-niko.svg", tags: ["Demonstrations", "Corporate", "Brand"], featured: false, published: true },
  { id: "t5", slug: "sora-bennett", name: "Sora Bennett", discipline: "Creator & entrepreneur", location: "Seoul · London", bio: "Design-led founder and creator connecting culture, technology and contemporary style.", image: "/talent-sora.svg", tags: ["Campaigns", "Social", "Speaking"], featured: false, published: true },
  { id: "t6", slug: "theo-jameson", name: "Theo Jameson", discipline: "Comedian & writer", location: "Chicago", bio: "Quick-witted comedian and writer bringing warmth and intelligence to live stages and screens.", image: "/talent-theo.svg", tags: ["Hosting", "Corporate", "Appearances"], featured: false, published: true },
];

export const defaultContent: SiteContent = {
  servicesIntro: "From one unforgettable moment to a year-long partnership, every brief begins with fit, feasibility and care.",
  foundationTitle: "Opportunity should not depend on proximity.",
  foundationBody: "The Velaire Access Fund is sample content for a proposed independent programme supporting arts access, creative mentorship and community-led projects. No charity affiliation or registration is claimed.",
  contactEmail: "hello@velaire.example", contactPhone: "+1 212 555 0147", featuredHeading: "Remarkable people. Considered partnerships.",
  faqs: [
    { question: "Does an enquiry guarantee availability?", answer: "No. Every request is subject to schedule, suitability, contracting and the talent's approval." },
    { question: "How far ahead should I enquire?", answer: "Four to twelve weeks is a helpful starting point, though larger campaigns and international events often need longer." },
    { question: "Do you publish fees?", answer: "Fees vary by scope, location, usage, timing and exclusivity. A budget range helps us recommend realistic options." },
    { question: "How are payments verified?", answer: "Payment submissions are reviewed manually. A hash or screenshot is never treated as automatic confirmation." },
  ],
};
