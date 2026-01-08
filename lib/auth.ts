// lib/auth.ts
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { deleteCookie } from "cookies-next";

// ---- Normal user signup ----
export async function signupUser(
  email: string,
  password: string,
  name: string
) {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const ref = doc(db, "users", userCred.user.uid);
    await setDoc(ref, {
      email,
      name,
      role: "user",
      createdAt: serverTimestamp(),
    });

    return userCred.user;
  } catch (error: any) {
    throw error; // ✅ keep firebase error
  }
}

// ---- Admin signup ----
export async function signupAdmin(email: string, password: string) {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const ref = doc(db, "users", userCred.user.uid);
    await setDoc(ref, {
      email,
      displayName: email.split("@")[0],
      role: "admin",
      createdAt: serverTimestamp(),
    });

    return userCred.user;
  } catch (error: any) {
    throw error;
  }
}

// ---- Login (🔥 IMPORTANT FIX HERE) ----
export async function login(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    // ✅ Normalize error so err.code ALWAYS exists
    throw {
      code: error.code || "auth/unknown",
      message: error.message || "Authentication failed",
    };
  }
}

// ---- Logout ----
export async function logout() {
  await signOut(auth);
  deleteCookie("firebase-auth");
}

// ---- Get user role ----
export async function getUserRole(uid: string) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data()?.role : null;
  } catch (error) {
    console.error("Get role error:", error);
    return null;
  }
}
