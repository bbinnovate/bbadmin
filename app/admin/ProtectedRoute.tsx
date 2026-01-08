"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.push("/login");
          return;
        }

        // Get role from Firestore
        const role = await getUserRole(user.uid);

        if (role === "admin") {
          setAllowed(true);
        } else {
          router.push("/unauthorized");
        }
      } catch (err) {
        console.error("Error checking user permissions:", err);
        alert("Error verifying permissions. Check Firestore connection.");
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center text-lg font-semibold">
        Checking permissions…
      </div>
    );
  }

  return allowed ? <>{children}</> : null;
}
