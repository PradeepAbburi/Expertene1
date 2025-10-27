import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/layout/Navigation';
import Hero from '@/components/sections/Hero';
import { motion } from 'framer-motion';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
  <div style={{ margin: 0, padding: 0, overflow: 'hidden', height: '100vh', width: '100vw' }} className="scrollbar-hide">
      {/* Always show navbar at the top, outside main content */}
      <Navigation />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-0 bg-black flex items-center justify-center scrollbar-hide"
        style={{ width: '100vw', height: '100vh', backgroundColor: '#000', margin: 0, padding: 0, overflow: 'hidden' }}
      >
      <style>{`
        .scrollbar-hide {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
        {/* Only Hero section, fit to screen, no scroll */}
        <main className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#000', padding: 0, margin: 0, height: '100vh', width: '100vw', overflow: 'hidden' }}>
          <div style={{ width: '100vw', height: '100vh', padding: 0, boxSizing: 'border-box', margin: 0, overflow: 'hidden' }}>
            <Hero />
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default Index;