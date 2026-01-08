"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import TaxiMobile from "./TaxiMobile";
type NavItem = { label: string; href?: string };

const NAV_ITEMS: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/aboutus" },
  { label: "SERVICES", href: "/services" },
  { label: "TEAM", href: "/teams" },
  { label: "CLIENTS", href: "/clients" },
  { label: "CASE STUDIES", href: "/work" },
  { href: "https://bbstudios.bombayblokes.com", label: "BB STUDIOS" },
  { href: "https://bbstudios.bombayblokes.com/bomb.ai", label: "BOMB AI" },
  { label: "CAREERS", href: "/join-our-team" },
  { label: "CONTACT", href: "/contactus" },
  { href: "/estimates-calculator", label: "COST ESTIMATOR" },
];

const BOTTOM_BAR_H = 68;

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname(); // ✅ get current route

  // Lock/unlock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleItemClick = () => {
    // Close the menu when a link is clicked
    setOpen(false);
  };

  return (
    <>
      {/* <TaxiMobile /> */}
      {/* Backdrop */}
      <div
        aria-hidden
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-200 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Menu sheet */}
      <nav
        id="mobile-nav-sheet"
        className={`fixed left-3 right-3 md:hidden z-[70] origin-bottom transition-[opacity,transform] duration-200 ${
          open
            ? "opacity-100 translate-y-0 scale-y-100"
            : "opacity-0 translate-y-1 scale-y-[0.98] pointer-events-none"
        }`}
        style={{ bottom: BOTTOM_BAR_H + 12 }}
      >
        <div
          className="rounded-t-[22px] rounded-b-none border-[3px] border-b-0 border-black
                     bg-white shadow-none px-3 pt-3 pb-4"
        >
          <ul className="grid grid-cols-2 gap-2.5">
            {NAV_ITEMS.map((item, i) => {
              const isActive =
                item.href &&
                (pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href)));

              return (
                <li key={item.label} className={i === NAV_ITEMS.length - 1 ? "col-span-2" : ""}>
                  <Link
                    href={item.href || "#"}
                    onClick={handleItemClick}
                    className={`
                      relative block w-full overflow-hidden
                      rounded-[14px] border-[2.5px] border-black
                      transition-colors duration-300 text-center
                      ${
                        isActive
                          ? "bg-[#FAB31E] text-black"
                          : "bg-[#1D1D1D] text-white"
                      }
                      active:translate-y-[1px]
                    `}
                  >
                    <span
                      aria-hidden
                      className={`
                        absolute right-0 inset-y-0 bg-[#FAB31E]
                        transition-[width] duration-300 ease-out rounded-r-[12px]
                        ${isActive ? "w-full" : "w-2.5"}
                      `}
                    />
                    <span className="relative z-10 block px-4 py-3 font-semibold tracking-wide">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Bottom bar */}
      <div
        className={`fixed left-3 right-3 bottom-3 md:hidden z-[80] border-[3px] border-black bg-white ${
          open ? "rounded-t-[0px] rounded-b-[22px]" : "rounded-[22px]"
        }`}
        style={{ height: BOTTOM_BAR_H }}
      >
        <div className="h-full flex items-center justify-between px-4">
          {/* LEFT: Menu / Close Button */}
          <button
          
            onClick={() => setOpen((v) => !v)}
            className="rounded-[10px] border-[2.5px] border-black px-1 py-1
                       text-[13px] font-semibold tracking-wide bg-white
                       transition-[opacity,transform] duration-200
                       active:translate-y-[1px]"
            aria-expanded={open}
            aria-controls="mobile-nav-sheet"
          >
            {open ? "CLOSE" : "MENU"}
          </button>

          {/* CENTER: Logo */}
          <div className="flex-1 flex justify-center relative">
  <Link href="/">
    <div className="relative inline-block">
      {/* Logo */}
      <Image
        src="/images/bblogo.webp"
        alt="Bombay Blokes Logo"
        width={160}
        height={50}
        className="object-contain transition-opacity duration-300"
      />

    
    </div>
  </Link>
</div>


          {/* RIGHT: WhatsApp Icon */}
          <a
            href="https://wa.me/919920207985"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <Image
            width={100}
            height={100}
              src="/images/whatsapp.svg"
              alt="WhatsApp"
              className="w-10 h-10"
            />
          </a>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[84px] md:hidden" />
    </>
  );
};

export default MobileNav;
