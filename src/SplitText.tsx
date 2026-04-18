import { useMemo } from "react";
import { motion, Variants } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animationSpeed?: number;
}

export default function SplitText({ 
  text, 
  className = "", 
  delay = 0,
  animationSpeed = 0.05 
}: SplitTextProps) {
  const letters = useMemo(() => text.split(""), [text]);

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: animationSpeed, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.h2
      style={{ display: "flex", overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span
          variants={child}
          key={index}
          style={{ display: "inline-block" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h2>
  );
}
