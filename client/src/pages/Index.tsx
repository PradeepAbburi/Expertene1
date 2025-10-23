import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/layout/Navigation';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Stats from '@/components/sections/Stats';
import Testimonials from '@/components/sections/Testimonials';
import CTA from '@/components/sections/CTA';
import { motion } from 'framer-motion';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
  className="relative min-h-screen bg-black overflow-x-hidden"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        backgroundColor: '#000',
  paddingLeft: '15vw',
  paddingRight: '15vw',
        boxSizing: 'border-box',
        maxWidth: '100vw'
      }}
    >
      {/* Show navbar only for logged-in users */}
      {isAuthenticated && <Navigation />}

      {/* Main content: all sections inside one main container */}
      <main className="relative w-full" style={{ backgroundColor: '#000', paddingTop: 0, marginTop: 0 }}>
        {/* Move Hero section to the very top */}
        <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:'8vw',paddingRight:'8vw',boxSizing:'border-box', marginTop: 0, paddingTop: 0}}><Hero /></div>
        {/* ...existing code... */}
        <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:0,paddingRight:0,boxSizing:'border-box'}}><Features /></div>
        <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:'8vw',paddingRight:'8vw',boxSizing:'border-box'}}><Stats /></div>
        <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:'8vw',paddingRight:'8vw',boxSizing:'border-box'}}>
          <Testimonials />
          {/* ...existing code... */}
          <section className="relative w-full bg-black py-16 sm:py-24">
            <div className="relative w-full px-4 md:px-6 mx-auto text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 hero-text-shadow">Content Blocks</h3>
              <div className="grid gap-10 md:grid-cols-4">
                {/* ...existing code... */}
              </div>
            </div>
          </section>
        </div>
        {/* ...existing code... */}
        <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:'8vw',paddingRight:'8vw',boxSizing:'border-box', marginTop: '48px'}}>
          <section className="relative w-full bg-black py-24 sm:py-32">
            <div className="relative w-full px-4 md:px-6 mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 hero-text-shadow">Frequently Asked Questions</h2>
              <div className="max-w-2xl mx-auto text-left">
                {/* ...existing code... */}
              </div>
            </div>
          </section>
        </div>
        {/* ...existing code... */}
        <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:'8vw',paddingRight:'8vw',boxSizing:'border-box', marginBottom: 0, paddingBottom: 0}}><CTA /></div>
      </main>
    </motion.div>
  );
};

export default Index;