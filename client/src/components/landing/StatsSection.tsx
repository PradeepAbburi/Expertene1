import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const StatsSection = () => {
  const stats = [
    { value: '10K+', label: 'Active Creators' },
    { value: '50K+', label: 'Articles Published' },
    { value: '1M+', label: 'Monthly Readers' },
    { value: '150+', label: 'Countries' }
  ];

  return (
    <section className="py-20 w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative backdrop-blur-3xl"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
              
              <div className="relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Join Our Growing Community
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Start sharing your knowledge today and connect with millions of learners worldwide.
                  </p>
                  <Button asChild size="lg">
                    <Link to="/auth">Get Started Free</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};