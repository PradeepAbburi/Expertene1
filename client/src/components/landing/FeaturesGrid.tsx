import { motion } from 'framer-motion';
import { Trophy, Users, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: Trophy,
    title: 'Knowledge Rewards',
    description: 'Earn rewards and recognition for sharing valuable content.'
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Connect with like-minded creators and build lasting relationships.'
  },
  {
    icon: Zap,
    title: 'Instant Publishing',
    description: 'Write and publish with our lightning-fast editor.'
  },
  {
    icon: Shield,
    title: 'Content Protection',
    description: 'Your content is secure with enterprise-grade protection.'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export const FeaturesGrid = () => {
  return (
    <section className="py-20 bg-muted/30 w-full">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          Why Creators Choose <span className="text-gradient">Expertene</span>
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div className="p-8 h-full bg-background border-r border-b last:border-r-0 hover:bg-muted/10 transition-colors duration-300">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};