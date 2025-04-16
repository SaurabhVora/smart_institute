import { Variants } from "framer-motion";

export const navbarVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    } 
  },
};

export const navItemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      type: "spring",
      stiffness: 200,
    },
  }),
  hover: { 
    scale: 1.05, 
    color: "#ffffff", 
    y: -2,
    transition: { type: "spring", stiffness: 300 } 
  },
  tap: { scale: 0.95 },
};

export const buttonVariants: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + (i * 0.1),
      duration: 0.5,
      ease: "easeOut"
    },
  }),
  hover: { 
    scale: 1.05,
    y: -2,
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
    transition: { 
      type: "spring", 
      stiffness: 400,
      damping: 10
    } 
  },
  tap: { 
    scale: 0.95,
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
  },
};

export const logoVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
  hover: { 
    scale: 1.05, 
    transition: { type: "spring", stiffness: 300 },
    textShadow: "0 0 8px rgba(59, 130, 246, 0.6)"
  },
};

export const mobileMenuVariants: Variants = {
  closed: { opacity: 0, x: "100%" },
  open: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      when: "beforeChildren",
      staggerChildren: 0.1,
    }
  },
  exit: { 
    opacity: 0, 
    x: "100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  }
};

export const mobileNavItemVariants: Variants = {
  closed: { opacity: 0, x: 20 },
  open: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  exit: { opacity: 0, x: 20 }
};

export const glowVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 0.8, transition: { duration: 1 } },
  exit: { opacity: 0, transition: { duration: 0.5 } }
}; 