"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

const directionOffsets = {
  up: { y: 16 },
  down: { y: -16 },
  left: { x: 16 },
  right: { x: -16 },
  none: {},
};

export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  direction = "up",
  className,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffsets[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
