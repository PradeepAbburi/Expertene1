import { motion } from 'framer-motion';
import { Trophy, Users, Rocket, Shield, Target, Zap } from 'lucide-react';

const features = [
  {
    icon: Trophy,
    title: 'Earn Recognition',
    description: 'Get rewarded for your valuable expertise and contributions'
  },
  {
    icon: Users,
    title: 'Build Community',
    description: 'Connect with like-minded experts and grow your network'
  },
  {
    icon: Rocket,
    title: 'Fast Publishing',
    description: 'Create and share content instantly with modern tools'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your work is protected with enterprise-grade security'
  },
  {
    icon: Target,
    title: 'Reach Audience',
    description: 'Connect with your ideal audience and build a following'
  },
  {
    icon: Zap,
    title: 'Rapid Growth',
    description: 'Accelerate your personal brand with powerful features'
  }
];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8
    }
  }
};

const Features = () => {
  return (
    <section className="relative w-full bg-gradient-to-b from-background to-background/80 py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      
      <div className="relative w-full px-4 md:px-6">
        <motion.div 
          variants={itemVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center w-full mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 hero-text-shadow">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive tools and features to help you succeed in your content creation journey.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-muted/[0.03] border border-border/50 rounded-xl p-6 hover:bg-muted/[0.08] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/[0.02] rounded-xl" />
              <feature.icon className="h-10 w-10 text-primary mb-4 transition-transform group-hover:scale-110 duration-500" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;