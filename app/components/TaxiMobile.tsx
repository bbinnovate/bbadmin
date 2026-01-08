"use client";

import React, { useEffect, useState } from "react";
import { motion, useTransform, useMotionValue } from "framer-motion";

const Taxi = () => {
  const scrollY = useMotionValue(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [docHeight, setDocHeight] = useState(1);
  const [taxiWidth, setTaxiWidth] = useState(120);

  const getTaxiWidth = () => {
    if (typeof window === "undefined") return 120;
    if (window.innerWidth < 480) return 70;
    if (window.innerWidth < 768) return 90;
    return 120;
  };

  useEffect(() => {
    const updateSizes = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fullDocHeight = document.documentElement.scrollHeight;

      setViewportWidth(vw);
      setTaxiWidth(getTaxiWidth());

      const scrollableHeight = Math.max(fullDocHeight - vh, 1);
      setDocHeight(scrollableHeight);
    };

    const handleScroll = () => scrollY.set(window.scrollY);

    window.addEventListener("resize", updateSizes);
    window.addEventListener("scroll", handleScroll);

    updateSizes();
    handleScroll();

    return () => {
      window.removeEventListener("resize", updateSizes);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollY]);

  const distance = Math.max(viewportWidth - taxiWidth - 10, 0);
  const x = useTransform(scrollY, [0, docHeight], [0, distance]);

  // Hide on desktop
  if (viewportWidth >= 1024) return null;

  return (
    <motion.img
      src="/images/taxi.png"
      alt="Taxi"
      style={{
        position: "fixed",
        bottom: 65, // Use bottom instead of top for a fixed line
        left: 0,
        x,
        width: taxiWidth,
        height: "auto",
        zIndex: 81,
        pointerEvents: "none",
      }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
    />
  );
};

export default Taxi;
