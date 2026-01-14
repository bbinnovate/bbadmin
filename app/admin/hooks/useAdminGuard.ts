"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useAdminGuard = (permissionKey?: string) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const snap = await getDocs(collection(db, "users"));
      const me = snap.docs.find(
        (d) => d.data().email === user.email
      );

      if (!me) {
        router.replace("/login");
        return;
      }

      const data = me.data();
      const role = data.role;
      const permissions: string[] = Array.isArray(data.permissions)
        ? data.permissions
        : [];

      // ❌ Not admin
      if (role !== "admin") {
        router.replace("/admin");
        return;
      }

      // ❌ No permission
      if (
        permissionKey &&
        !permissions.includes("all") &&
        !permissions.includes(permissionKey)
      ) {
        router.replace("/admin");
        return;
      }

      setLoading(false);
    });

    return () => unsub();
  }, [permissionKey, router]);

  return loading;
};
