import { Variants } from "framer-motion";

// Fade in animation
export const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// Stats animation
export const statsAnimate: Variants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", stiffness: 100 }
};

// Card hover animation
export const cardHover = {
  scale: 1.03,
  boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
  transition: { duration: 0.2 }
};

// Staggered container animation
export const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// Staggered item animation
export const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Button hover animation
export const buttonHover = {
  scale: 1.05, 
  boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)"
};

// Button tap animation
export const buttonTap = {
  scale: 0.95
};

// Navigation item variants
export const navItemVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      type: "spring", 
      stiffness: 200 
    } 
  },
  hover: { 
    scale: 1.05, 
    color: "#ffffff", 
    y: -2,
    transition: { type: "spring", stiffness: 300 } 
  },
  tap: { scale: 0.95 }
}; 