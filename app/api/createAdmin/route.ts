import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function GET() {
  try {
    const email = "aryankuril@gmail.com";
    const password = "123456";

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const ref = doc(db, "users", userCred.user.uid);

    await setDoc(ref, {
      email,
      displayName: email.split("@")[0],
      role: "admin",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, uid: userCred.user.uid });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
