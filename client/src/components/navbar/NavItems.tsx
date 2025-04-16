import { Link } from "wouter";
import { motion } from "framer-motion";
import { NavItem } from "./types";
import { navItemVariants } from "./animations";

type NavItemsProps = {
  items: NavItem[];
  handleRestrictedItemClick: (e: React.MouseEvent, itemName: string) => void;
};

export function NavItems({ items, handleRestrictedItemClick }: NavItemsProps) {
  return (
    <div className="hidden lg:flex items-center space-x-8">
      {items.map((item, index) => (
        <motion.div
          key={item.name}
          variants={navItemVariants}
          custom={index}
          whileHover="hover"
          whileTap="tap"
          onClick={(e) => handleRestrictedItemClick(e, item.name)}
        >
          <Link href={item.path}>
            <a className="flex items-center text-white/80 hover:text-white transition-colors">
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </a>
          </Link>
        </motion.div>
      ))}
    </div>
  );
} 