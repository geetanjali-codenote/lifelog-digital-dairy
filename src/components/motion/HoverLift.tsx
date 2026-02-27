"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  liftAmount?: number;
}

export function HoverLift({
  children,
  className,
  liftAmount = -4,
}: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{
        y: liftAmount,
        boxShadow: "0 12px 24px rgba(90, 82, 255, 0.1)",
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
