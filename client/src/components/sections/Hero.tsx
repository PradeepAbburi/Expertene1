import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const textRevealVariants: Variants = {
  initial: { opacity: 0, y: 100 },
  animate: {
    opacity: 1,
    y: 0,
  },
};

const Hero = () => {
  return (
  <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black scrollbar-hide" style={{marginTop: 0, paddingTop: 0, marginBottom: 0, paddingBottom: 0, height: '100vh'}}>
      <style>{`
        .scrollbar-hide {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      {/* Grid-like checkbox background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 32px)`
      }} />
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      {/* Content */}
  <div className="relative w-full px-4 md:px-8" style={{marginTop: 0, paddingTop: 0, marginBottom: 0, paddingBottom: 0}}>
        <div className="mx-auto flex w-full flex-col items-center gap-12 text-center">
          <motion.div 
            initial="initial"
            animate="animate"
            transition={{ 
              duration: 0.8,
              staggerChildren: 0.1 
            }}
            className="space-y-6"
          >
            <div className="overflow-hidden">
              <motion.h1 
                variants={textRevealVariants}
                transition={{ duration: 0.8 }}
                className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl hero-text-shadow"
              >
                Share Your
              </motion.h1>
            </div>
            
            <div className="overflow-hidden">
              <motion.h1 
                variants={textRevealVariants}
                transition={{ duration: 0.8 }}
                className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-outline"
              >
                Knowledge
              </motion.h1>
            </div>

            <div className="overflow-hidden">
              <motion.p
                variants={textRevealVariants}
                transition={{ duration: 0.8 }}
                className="mx-auto mt-8 w-full text-lg text-gray-400 text-balance md:text-xl"
              >
                Join thousands of experts sharing their expertise on our platform
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Button 
              asChild
              size="lg" 
              className="min-w-[200px] transition-smooth hover:scale-105 hover:shadow-2xl"
            >
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg" 
              className="min-w-[200px] transition-smooth hover:scale-105 hover:bg-white/5"
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;