"use client";
import { useState } from "react";
import { login, getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { setCookie } from "cookies-next";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
 const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await login(email, password);

      const role = await getUserRole(userCred.user.uid);
      const token = await userCred.user.getIdToken();

      setCookie("firebase-auth", token, {
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      if (!role) {
        setError("User role not assigned. Contact admin.");
        return;
      }

      router.push(role === "admin" ? "/admin" : "/");

    } 
    catch (err: any) {
  console.error("LOGIN ERROR:", err);

  switch (err.code) {
    case "auth/invalid-credential":
      setError("❌ Incorrect email or password");
      break;

    case "auth/invalid-email":
      setError("❌ Invalid email format");
      break;

    case "auth/user-disabled":
      setError("❌ This account has been disabled");
      break;

    case "auth/too-many-requests":
      setError("❌ Too many attempts. Try again later");
      break;

    default:
      setError("❌ Login failed. Please try again");
  }
}

 finally {
      setLoading(false);
    }
  }


  return (
    <div >
    <Navbar/>
<div className="flex lg:h-[90vh] h-[60vh] items-center justify-center container">
  
  <form
    onSubmit={handleLogin}
    className="relative bg-black p-10  shadow-md w-96 space-y-4 overflow-hidden rounded-[20px]"
  >
    {/* Right border */}
    <div className="absolute -right-1 top-0 w-4 sm:w-4 md:w-5 h-full bg-[#FAB31E]"></div>

    <h2 className="text-xl font-semibold white-text text-center">Login</h2>
    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Email"
      required
      className="w-full border p-2 rounded white-text"
    />


<div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full border p-2 rounded text-white bg-black pr-12"
            />

            <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-80 hover:opacity-100 transition cursor-pointer"
>
  {showPassword ? (
    <EyeOff size={20} />
  ) : (
    <Eye size={20} />
  )}
</button>

          </div>


    <Button
      type="submit"
      disabled={loading}
      className=" white-text "
       text= {loading ? "Logging in..." : "Login"}
   />

   <p className="text-center text-white text-sm mt-2">
  Don’t have an account?{" "}
  <a href="/signup" className="text-[#FAB31E] underline">
    Signup
  </a>
</p>
    
  </form>
</div>
<Footer/>
</div>

  );
}
