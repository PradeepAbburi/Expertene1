import { motion } from 'framer-motion';

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Articles Created' },
  { value: '1M+', label: 'Monthly Views' },
  { value: '95%', label: 'Satisfaction Rate' }
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

const Stats = () => {
  return (
    <section className="relative w-full bg-black py-16 sm:py-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="relative w-full px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative text-center"
            >
              <motion.div 
                initial={{ scale: 1 }}
                whileInView={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                viewport={{ once: true }}
                className="mb-2"
              >
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold hero-text-shadow">
                  {stat.value}
                </h3>
              </motion.div>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;