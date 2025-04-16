import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "wouter";
import { NavItem } from "./types";
import { mobileMenuVariants, mobileNavItemVariants } from "./animations";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  handleRestrictedItemClick: (e: React.MouseEvent, itemName: string) => void;
};

export function MobileMenu({ isOpen, onClose, navItems, handleRestrictedItemClick }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={mobileMenuVariants}
          initial="closed"
          animate="open"
          exit="exit"
          className="fixed inset-0 bg-[#0F172A] z-50 lg:hidden"
        >
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="px-4 py-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                variants={mobileNavItemVariants}
                custom={index}
                onClick={(e) => handleRestrictedItemClick(e, item.name)}
              >
                <Link href={item.path}>
                  <a className="flex items-center py-3 text-lg text-white/80 hover:text-white transition-colors">
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </a>
                </Link>
              </motion.div>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 