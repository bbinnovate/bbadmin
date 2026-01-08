// app/components/DesktopNav.tsx
"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import { useRouter, usePathname } from "next/navigation";


const YELLOW = "#FAB31E";
const DARK = "#1D1D1D";

const links = [
  { href: "/aboutus", label: "About" },
  { href: "/services", label: "Services" },
  {
    href: "https://bbstudios.bombayblokes.com",
    label: "BB Studios",
    logo: "/images/BBStudios2.png", // 👈 add your studio logo path
  },
  {
    href: "https://bbstudios.bombayblokes.com/bomb.ai",
    label: "Bomb Ai",
    logo: "/images/bombai.jpg", // 👈 add your bomb.ai logo path
  },
  { href: "/clients", label: "Clients" },
  { href: "/work", label: "Case Studies" },
  { href: "/teams", label: "Team" },
  { href: "/join-our-team", label: "Career" },
  { href: "/contactus", label: "Contact" },
  { href: "/estimates-calculator", label: "Cost Estimator" },
];

export default function DesktopNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
   const pathname = usePathname();

  // refs
  const root = useRef<HTMLDivElement | null>(null);
  const shell = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);

  const yellow = useRef<HTMLDivElement | null>(null);
  const black = useRef<HTMLDivElement | null>(null);
  const divider = useRef<HTMLDivElement | null>(null);
  const bottomRow = useRef<HTMLDivElement | null>(null);

  const textRefs = useRef<HTMLAnchorElement[]>([]);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Initialize GSAP timeline
  useLayoutEffect(() => {
    const s = stage.current;
    const y = yellow.current;
    const b = black.current;
    const d = divider.current;
    const br = bottomRow.current;
    const sh = shell.current;

    if (!s || !y || !b || !d || !br || !sh) return;

    // base states
    gsap.set(stage.current, { opacity: 0, pointerEvents: "none" });
    gsap.set(y, {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      width: 96,
      height: 96,
      borderRadius: 16,
      backgroundColor: YELLOW,
    });
    gsap.set(b, {
      position: "absolute",
      inset: 0,
      backgroundColor: DARK,
      clipPath: "inset(0 100% 0 0 round 0px)",
    });
    gsap.set(d, { scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set(br, { opacity: 0, y: 10 });

    const ctx = gsap.context(() => {
      const dur1 = 0.8;
      const dur2 = 0.8;
      const ease = "expo.inOut";

      tl.current = gsap.timeline({ paused: true });

      tl.current
        // Stage in
        .to(stage.current, { opacity: 1, pointerEvents: "auto", duration: 1 }, 0)
        // 1) Yellow expands
        .to(
          y,
          {
            width: () => s.clientWidth,
            height: () => s.clientHeight,
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
            borderRadius: 0,
            duration: dur1,
            ease,
          },
          0.02
        )
        // 2) Black wipes in
        .to(
          b,
          {
            clipPath: "inset(0 0% 0 0 round 0px)",
            duration: dur2,
            ease,
          },
          ">-0.05"
        )
        // 3) Yellow shrinks into right accent line
        .to(
          y,
          {
            width: 15,
            height: () => s.clientHeight,
            left: () => s.clientWidth + 3,
            xPercent: -100,
            top: "50%",
            yPercent: -50,
            duration: dur2,
            ease,
          },
          "<+0.1"
        )
        // Divider + bottom row
        .fromTo(
          d,
          { scaleY: 0, opacity: 0, transformOrigin: "50% 100%" },
          { scaleY: 1, opacity: 1, duration: 0.35, ease: "power3.out" },
          "-=0.18"
        )
        .fromTo(
          br,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.28, ease: "power3.out" },
          "-=0.22"
        )
        .to(sh, { borderTopLeftRadius: 0, borderTopRightRadius: 0, duration: 0.18, ease }, 0.06)
        // Animate menu text from center
        .fromTo(
          textRefs.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1 },
          "-=0.15"
        );
    }, root);

    return () => ctx.revert();
  }, []);

  // Play / reverse timeline
  useEffect(() => {
    if (!tl.current) return;
    if (open) tl.current.play();
    else tl.current.reverse();
  }, [open]);

  // Clear refs on unmount
  useEffect(() => {
    return () => {
      textRefs.current = [];
    };
  }, []);

  // ✅ Prevent body scroll when menu is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (open) {
      const scrollY = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    } else {
      const scrollY = body.style.top;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      html.style.overflow = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      html.style.overflow = "";
    };
  }, [open]);




    const hatRef = useRef(null);

 useEffect(() => {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 5 }); 
  // repeat: -1 → infinite loop
  // repeatDelay: 5 → wait 5 sec before coming again

  tl.fromTo(
    hatRef.current,
    { y: -80, opacity: 0, rotate: -20 },
    {
      y: -10,
      opacity: 1,
      rotate: 0,
      duration: 1.2,
      ease: "power3.out",
    }
  );

  tl.to(hatRef.current, {
    opacity: 0,
    y: -40,
    duration: 0.8,
    delay: 20, // hat stays on logo for 2 sec
    ease: "power2.inOut",
  });
}, []);


  return (
    <div className="">
      <div ref={root} className="py-5 px-10  inset-x-0 z-[100000]">
        {/* nav shell */}
        <div
          ref={shell}
          className="h-[90px] container bg-[rgba(142,142,142,0.20)] rounded-[20px] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] items-center absolute inset-x-0 z-[100001]"
        >
          
          {/* ⭐⭐ END DECOR ⭐⭐ */}
          <div className="flex items-center justify-between py-5 px-10 ">
            <div className="relative inline-block">
      {/* Your Logo */}
      <Link href="/">
        <Image
          src="/images/bblogo.webp"
          alt="Bombay Blokes Logo"
          width={210}
          height={80}
          className="object-cover transition-opacity duration-300"
        />
      </Link>

    </div>
            {/* HAMBURGER */}
            <div className="flex items-center gap-4">
              <Button
                href="/contactus"
                text="Start Growing"
                className="relative justify-center text-black font-semibold transition-colors"
              />

              <button
                onClick={() => {
                  if (open) {
                    if (tl.current) tl.current.pause(0);
                    setOpen(false);
                  } else {
                    setOpen(true);
                  }
                }}
                aria-label="Toggle menu"
                className="relative grid h-12 w-12 text-[20px] border-2 rounded-[5px] border-black leading-5 cursor-pointer font-miso place-items-center text-black"
              >

              
                M E <br />N U
              </button>
            </div>
          </div>

          {/* stage */}
          <div
            ref={stage}
            className="relative mt-10 h-[550px] w-[650px] mx-auto flex justify-center items-center overflow-hidden rounded-xl z-[100002]"
          >
            <div ref={black} />
            <div ref={yellow} />

            {/* CLOSE BUTTON */}
            {open && (
              <button
                ref={(el) => {
                  if (el) {
                    gsap.fromTo(
                      el,
                      { opacity: 0, y: -20 },
                      {
                        opacity: 1,
                        y: 0,
                        delay: 2,
                        duration: 0.8,
                        ease: "power3.out",
                      }
                    );
                  }
                }}
                onClick={() => {
                  gsap.to(".close-btn", {
                    opacity: 0,
                    y: -10,
                    duration: 0.2,
                    ease: "power3.inOut",
                  });

                  if (tl.current) tl.current.pause(0);
                  setTimeout(() => setOpen(false), 50);
                }}
                className="close-btn absolute cursor-pointer top-6 right-6 text-white text-[16px] uppercase tracking-wider font-[Miso] z-20 hover:text-[#FAB31E] transition-colors"
              >
                Close
              </button>
            )}

            {/* divider */}
            <div
              ref={divider}
              className="absolute left-1/2 mt-[230px] -translate-y-1/2 w-[2px] h-[60%]"
            />

            {/* menu links */}
            <div className="relative z-10 grid grid-cols-2 grid-rows-4 gap-y-10 px-12 py-8 lg:mb-15 md:mb-10 mb-5 text-center place-items-center w-full">
             {links.map((link, index) => {
  const isActive = pathname === link.href;

  return (
    <div
      key={index}
      className={`w-full flex justify-center items-center relative ${
        index % 2 === 0 ? "border-r border-white" : ""
      }`}
    >
      <Link
        href={link.href}
        onClick={(e) => {
          e.preventDefault();
          if (tl.current) tl.current.pause(0);
          setOpen(false);

          if (window.location.pathname === link.href) {
            router.refresh();
          } else {
            router.push(link.href);
          }
        }}
        ref={(el) => {
          if (el) textRefs.current[index] = el;
        }}
        className={`flex items-center justify-center gap-3 font-[Miso] text-[36px] font-normal uppercase leading-none transition-colors 
          ${
            isActive
              ? "text-[#FAB31E]" // 👈 active color (yellow)
              : "text-white hover:text-[#FAB31E]"
          }`}
      >
        {link.logo && (
          <div className="w-[40px] h-[40px] rounded-[20px] overflow-hidden border border-white bg-white flex-shrink-0">
            <Image
              src={link.logo}
              alt={`${link.label} Logo`}
              width={30}
              height={30}
              className="object-contain w-full h-full"
            />
          </div>
          
        )}
        {link.label}
      </Link>
    </div>
  );
})}

            </div>

            {/* bottom row social icons */}
            <div
              ref={bottomRow}
              className="absolute bottom-5 left-0 right-0 flex items-center justify-center px-6 text-xs uppercase tracking-wide"
            >
              <div className="flex flex-col items-center gap-2 text-center z-10 cursor-pointer">
                <p className="text-white text-lg tracking-wide">REACH US ON</p>
                <div className="flex gap-8 relative z-50">
                  {/* <a
                    // href="/contactus"
                    className="body2 text-[#FAB31E]  tracking-wide"
                  >
                   Connect Us
                  </a> */}
                  <a
                    href="https://www.instagram.com/bombay_blokes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body2 text-[#FAB31E] hover:underline hover:text-[#FAB31E] tracking-wide"
                  >
                    INSTAGRAM
                  </a>
                  <a
                    href="https://in.linkedin.com/company/bombay-blokes-digital-solutions-llp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body2 text-[#FAB31E] hover:underline hover:text-[#FAB31E] tracking-wide"
                  >
                    LINKEDIN
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-[100000] transition-all duration-500 ${
            open
              ? "opacity-90 backdrop-blur-3xl"
              : "opacity-0 pointer-events-none backdrop-blur-0"
          }`}
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={() => {
            if (tl.current) tl.current.pause(0);
            setOpen(false);
          }}
        />
      </div>
    </div>
  );
}
