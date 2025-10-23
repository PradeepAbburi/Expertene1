import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8
    }
  }
};

const CTA = () => {
  return (
    <section className="relative w-full bg-black py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 blur-[120px]" />
      </div>

      <div className="relative w-full px-4 md:px-6">
        <motion.div 
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-border/50"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-secondary/[0.03]" />
          
          <div className="relative px-6 py-24 sm:px-12 sm:py-32 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 hero-text-shadow w-full mx-auto">
                Ready to Share Your{' '}
                <span className="text-outline">Expertise?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 w-full mx-auto">
                Join our community of experts and start sharing your knowledge with the world today.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  asChild
                  size="lg" 
                  className="min-w-[200px] text-lg transition-smooth hover:scale-105 hover:shadow-2xl group"
                >
                  <Link to="/auth" className="flex items-center justify-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  size="lg"
                  className="min-w-[200px] text-lg transition-smooth hover:scale-105 hover:bg-white/5"
                >
                  <Link to="/features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;