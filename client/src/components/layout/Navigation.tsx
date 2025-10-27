import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export const Navigation = () => {
  const { isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setDropdownOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setDropdownOpen(false), 1500);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      style={{ marginBottom: 0, paddingBottom: 0, height: '72px', boxShadow: 'none' }}
    >
      <nav
        className="container mx-auto px-4 flex items-center justify-between"
        style={{ height: '72px', marginBottom: 0, paddingBottom: 0, boxShadow: 'none', borderBottom: 'none' }}
      >
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="font-bold text-xl mr-8">
            Expertene
          </Link>
          {/* Centered subpage links for all users */}
          <div className="hidden md:flex gap-8 mx-auto items-center">
            <Link to="/about" className="relative px-2 py-1 font-medium text-base text-foreground transition-colors duration-200 group">
              About
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <Link to="/api" className="relative px-2 py-1 font-medium text-base text-foreground transition-colors duration-200 group">
              API &amp; Services
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            {/* Products dropdown between API & Services and Careers */}
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className="relative px-2 py-1 font-medium text-base text-foreground transition-colors duration-200 focus:outline-none flex items-center"
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                type="button"
              >
                Products
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg opacity-100 pointer-events-auto transition-opacity duration-200 z-50"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link to="/exp-notebook" className="block px-4 py-2 text-base text-foreground hover:bg-primary/10 transition-colors duration-200">EXP- NOTEBOOK</Link>
                </div>
              )}
            </div>
            <Link to="/careers" className="relative px-2 py-1 font-medium text-base text-foreground transition-colors duration-200 group">
              Careers
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <Link to="/contact" className="relative px-2 py-1 font-medium text-base text-foreground transition-colors duration-200 group">
              Contact
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth?mode=signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/profile">Profile</Link>
            </Button>
          )}
        </div>
      </nav>
    </motion.header>
  );
}