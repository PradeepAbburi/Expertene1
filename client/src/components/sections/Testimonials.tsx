import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    quote: "This platform has transformed how I share my expertise. The tools and community are exceptional.",
    author: "Sarah Johnson",
    role: "Tech Educator",
    avatar: "/avatars/sarah.jpg"
  },
  {
    quote: "I've grown my following significantly since joining. The engagement tools are game-changing.",
    author: "Michael Chen",
    role: "Digital Creator",
    avatar: "/avatars/michael.jpg"
  },
  {
    quote: "The analytics and insights have helped me understand my audience better than ever before.",
    author: "Emma Davis",
    role: "Content Strategist",
    avatar: "/avatars/emma.jpg"
  }
];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
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

export default function Testimonials() {
  return (
    <section className="relative w-full bg-black py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="relative w-full px-4 md:px-6">
        <motion.div 
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mx-auto w-full text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 hero-text-shadow">
            Loved by Creators
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of successful content creators who've grown with our platform.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative bg-muted/[0.03] border border-border/50 rounded-xl p-6 group hover:bg-muted/[0.08] transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/[0.02] rounded-xl" />
              
              <Quote className="w-8 h-8 text-primary mb-4 opacity-50" />
              
              <blockquote className="mb-6">
                <p className="text-lg text-muted-foreground">"{testimonial.quote}"</p>
              </blockquote>
              
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}