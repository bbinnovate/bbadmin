import LandingPage from "./components/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bombay Blokes | Admin",
  description:
    "Access and manage all core operations of Bombay Blokes from the admin panel. Oversee blogs, users, career applications, analytics, scheduling, and content updates in one centralized dashboard.",
};


export default function Home() {
  return (
    <div >
      <Navbar/>
      <LandingPage/>
      <Footer/>
    </div>
  );
}
