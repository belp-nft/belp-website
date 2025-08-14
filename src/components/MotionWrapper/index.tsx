"use client";
import { motion } from "framer-motion";
import NoSSR from "@/components/NoSSR";
import { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  [key: string]: any; // for motion props
}

export default function MotionWrapper({
  children,
  fallback,
  className,
  ...motionProps
}: MotionWrapperProps) {
  const fallbackElement = fallback || (
    <div className={className}>{children}</div>
  );

  return (
    <NoSSR fallback={fallbackElement}>
      <motion.div className={className} {...motionProps}>
        {children}
      </motion.div>
    </NoSSR>
  );
}
