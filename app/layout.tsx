import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import PageLoader from "./components/PageLoader";
import "./globals.css";

const miso = localFont({
  src: [{ path: "../public/fonts/VAG-Regular2.otf", weight: "400" }],
  variable: "--font-miso",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
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
    <html lang="en" className={`${miso.variable} ${poppins.variable}`}>
      <body>
         {/* <Navbar/> */}
        <PageLoader>
      
        {children}
      </PageLoader>
      {/* <Footer/> */}
      </body>
    </html>
  );
}
