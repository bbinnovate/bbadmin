"use client";
import Image from "next/image";

import { useState, useEffect, ReactNode } from "react";

interface PageLoaderProps {
  children?: ReactNode; // 👈 make children optional
}

export default function PageLoader({ children }: PageLoaderProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      const handleLoad = () => setLoading(false);
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Image
          width={40}
          height={40}
          src="/images/BB-web-chai-1.gif"
          alt="Loading..."
          className="w-100 h-100"
        />
      </div>
    );
  }

  return <>{children}</>;
}