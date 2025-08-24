"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

type AnimatedCounterProps = {
  value: string;
  duration?: number;
  className?: string;
};

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  className,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    // Extract numeric part and suffix (e.g., "15+" -> 15, "+")
    const match = value.match(/^(\d+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const targetNumber = parseInt(match[1], 10);
    const suffix = match[2] || "";

    if (isNaN(targetNumber)) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);

      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(targetNumber * easedProgress);

      if (progress < 1) {
        setDisplayValue(`${currentValue}${suffix}`);
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(value);
      }
    };

    updateCounter();
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={!shouldReduceMotion ? { opacity: 0 } : {}}
      animate={isInView && !shouldReduceMotion ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {displayValue}
    </motion.span>
  );
};