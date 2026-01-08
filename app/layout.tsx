import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin",
  description:
    "Access and manage all core operations of Bombay Blokes from the admin panel. Oversee blogs, users, career applications, analytics, scheduling, and content updates in one centralized dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         {/* <Navbar/> */}
        <PageLoader>
      
        {children}
      </PageLoader>
      {/* <Footer/> */}
      </body>
    </html>
  );
}
