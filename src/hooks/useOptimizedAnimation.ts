"use client";
import { useReducedMotion } from "framer-motion";
import { useMemo } from "react";

export function useOptimizedAnimation() {
  const shouldReduceMotion = useReducedMotion();

  const optimizedVariants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    };
  }, [shouldReduceMotion]);

  const optimizedTransition = useMemo(() => {
    if (shouldReduceMotion) {
      return { duration: 0.2 };
    }

    return {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 1,
    };
  }, [shouldReduceMotion]);

  return {
    variants: optimizedVariants,
    transition: optimizedTransition,
    shouldReduceMotion,
  };
}

// Intersection Observer hook cho animation trigger
export function useIntersectionAnimation(threshold = 0.1) {
  const { variants, transition, shouldReduceMotion } = useOptimizedAnimation();

  const intersectionVariants = useMemo(() => ({
    hidden: variants.initial,
    visible: variants.animate,
  }), [variants]);

  const viewportOptions = useMemo(() => ({
    once: true,
    margin: "-50px",
    amount: threshold,
  }), [threshold]);

  return {
    initial: "hidden",
    whileInView: "visible",
    variants: intersectionVariants,
    transition,
    viewport: viewportOptions,
  };
}
