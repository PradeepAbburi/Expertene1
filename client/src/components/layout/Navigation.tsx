import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export const Navigation = () => {
  const { isAuthenticated } = useAuth();

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
        <Link to="/" className="font-bold text-xl">
          Expertene
        </Link>

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