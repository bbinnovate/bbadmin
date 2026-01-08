"use client";

import { useEffect } from "react";
import { signupAdmin } from "@/lib/auth";

export default function CreateAdmin() {
  useEffect(() => {
    signupAdmin("aryankuril@gmail.com", "123456")
      .then(() => alert("✅ Admin user created in Firestore!"))
      .catch((e: unknown) => console.error("Error creating admin:", e));
  }, []);

  return <div>Creating admin...</div>;
}
