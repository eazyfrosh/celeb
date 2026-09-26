import { createHash, randomBytes, scryptSync } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createInterface } from "node:readline/promises";

const rl=createInterface({input:process.stdin,output:process.stdout});
const email=(await rl.question("Admin email: ")).trim().toLowerCase();
const password=(await rl.question("Password (12+ chars, upper/lower/number): ")).trim();rl.close();
if(!/^\S+@\S+\.\S+$/.test(email)||password.length<12||!/[A-Z]/.test(password)||!/[a-z]/.test(password)||!/[0-9]/.test(password)){console.error("Invalid email or weak password.");process.exit(1)}
const {FIREBASE_ADMIN_PROJECT_ID:projectId,FIREBASE_ADMIN_CLIENT_EMAIL:clientEmail,FIREBASE_ADMIN_PRIVATE_KEY:key}=process.env;
if(!projectId||!clientEmail||!key){console.error("Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY first.");process.exit(1)}
if(!getApps().length)initializeApp({credential:cert({projectId,clientEmail,privateKey:key.replace(/\\n/g,"\n")})});
const salt=randomBytes(16).toString("hex"),passwordHash=`${salt}:${scryptSync(password,salt,64).toString("hex")}`;
await getFirestore().collection("admins").doc(email).create({email,passwordHash,createdAt:new Date().toISOString(),fingerprint:createHash("sha256").update(email).digest("hex")});
console.log(`Created admin ${email}`);
