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


// ======================================================
// NORMAL USER SIGNUP
// ======================================================
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

    // 🔥 IMPORTANT: document ID = UID
    const ref = doc(db, "users", userCred.user.uid);

    await setDoc(ref, {
      email,
      name,
      role: "user",
      permissions: [], // ✅ always define permissions
      createdAt: serverTimestamp(),
    });

    return userCred.user;
  } catch (error: any) {
    throw error;
  }
}


// ======================================================
// ADMIN SIGNUP
// ======================================================
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
      permissions: ["all"], // ✅ full access by default
      createdAt: serverTimestamp(),
    });

    return userCred.user;
  } catch (error: any) {
    throw error;
  }
}


// ======================================================
// LOGIN
// ======================================================
export async function login(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw {
      code: error.code || "auth/unknown",
      message: error.message || "Authentication failed",
    };
  }
}


// ======================================================
// LOGOUT
// ======================================================
export async function logout() {
  await signOut(auth);
  deleteCookie("firebase-auth");
}


// ======================================================
// GET USER ROLE
// ======================================================
export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return snap.data()?.role || null;
  } catch (error) {
    console.error("Get role error:", error);
    return null;
  }
}


// ======================================================
// GET USER PERMISSIONS
// ======================================================
export async function getUserPermissions(uid: string): Promise<string[]> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return [];

    const perms = snap.data()?.permissions;

    return Array.isArray(perms) ? perms : [];
  } catch (error) {
    console.error("Get permissions error:", error);
    return [];
  }
}