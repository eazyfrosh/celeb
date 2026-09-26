import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChatWidget } from "@/components/chat-widget";
import "./globals.css";
export const metadata:Metadata={title:{default:"Velaire — Talent, thoughtfully connected",template:"%s — Velaire"},description:"A sample independent talent booking and cultural impact platform.",robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/><main>{children}</main><Footer/><ChatWidget/></body></html>}
