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
    <div>
      {/* Always show navbar at the top, outside main content */}
      <Navigation />
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
        {/* Main content: all sections inside one main container */}
        <main className="relative w-full" style={{ backgroundColor: '#000', paddingTop: 0, marginTop: 0 }}>
          {/* Move Hero section to the very top, remove extra padding/margin */}
          <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:0,paddingRight:0,boxSizing:'border-box', marginTop: 0, paddingTop: 0}}><Hero /></div>
          <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:0,paddingRight:0,boxSizing:'border-box'}}><Features /></div>
          <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:'8vw',paddingRight:'8vw',boxSizing:'border-box'}}><Stats /></div>
          <div style={{width:'100vw',marginLeft:'calc(-50vw + 50%)',paddingLeft:'8vw',paddingRight:'8vw',boxSizing:'border-box'}}>
            <Testimonials />
            {/* ...existing code... */}
            <section className="relative w-full bg-black py-16 sm:py-24">
              <div className="relative w-full px-4 md:px-6 mx-auto text-center">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 hero-text-shadow">Content Blocks</h3>
                <div className="grid gap-10 md:grid-cols-5">
                  {/* Text Block */}
                  <div className="bg-gradient-to-br from-black/80 to-primary/10 border-2 border-primary rounded-3xl p-8 flex flex-col items-center shadow-xl">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-primary">
                      <rect x="10" y="14" width="28" height="6" rx="3"/>
                      <rect x="10" y="26" width="20" height="6" rx="3"/>
                      <rect x="10" y="38" width="14" height="6" rx="3"/>
                    </svg>
                    <h4 className="font-semibold mt-4 mb-2 text-lg">Text</h4>
                    <p className="text-muted-foreground">Paragraphs, headings, lists, quotes, and more for rich article writing.</p>
                  </div>
                  {/* Image Block */}
                  <div className="bg-gradient-to-br from-black/80 to-primary/10 border-2 border-primary rounded-3xl p-8 flex flex-col items-center shadow-xl">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-primary">
                      <rect x="8" y="10" width="32" height="28" rx="4"/>
                      <circle cx="18" cy="20" r="3"/>
                      <path d="M8 38l10-10 8 8 10-14 6 16"/>
                    </svg>
                    <h4 className="font-semibold mt-4 mb-2 text-lg">Image</h4>
                    <p className="text-muted-foreground">Embed images, illustrations, and infographics to enhance your content.</p>
                  </div>
                  {/* Code Block */}
                  <div className="bg-gradient-to-br from-black/80 to-primary/10 border-2 border-primary rounded-3xl p-8 flex flex-col items-center shadow-xl">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-primary">
                      <polyline points="20 22 14 28 20 34"/>
                      <polyline points="28 22 34 28 28 34"/>
                      <rect x="10" y="14" width="28" height="20" rx="4"/>
                    </svg>
                    <h4 className="font-semibold mt-4 mb-2 text-lg">Code</h4>
                    <p className="text-muted-foreground">Show code snippets with syntax highlighting for technical articles.</p>
                  </div>
                  {/* Embed Block */}
                  <div className="bg-gradient-to-br from-black/80 to-primary/10 border-2 border-primary rounded-3xl p-8 flex flex-col items-center shadow-xl">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-primary">
                      <rect x="10" y="14" width="28" height="20" rx="4"/>
                      <path d="M18 24h12"/>
                      <path d="M24 18v12"/>
                    </svg>
                    <h4 className="font-semibold mt-4 mb-2 text-lg">Embed</h4>
                    <p className="text-muted-foreground">Integrate videos, tweets, charts, and other external content.</p>
                  </div>
                  {/* Notion-like Block */}
                  <div className="bg-gradient-to-br from-black/80 to-secondary/10 border-2 border-secondary rounded-3xl p-8 flex flex-col items-center shadow-xl">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-secondary">
                      <rect x="8" y="8" width="32" height="32" rx="8"/>
                      <text x="24" y="32" textAnchor="middle" fontSize="18" fill="currentColor">N</text>
                    </svg>
                    <h4 className="font-semibold mt-4 mb-2 text-lg">Notion-style</h4>
                    <p className="text-muted-foreground">Flexible blocks inspired by Notion for advanced layouts and productivity.</p>
                  </div>
                </div>
                <div className="mt-10 text-center text-muted-foreground text-base">
                  <p>
                    <strong>Why Expertene?</strong> — Unlike Notion, Medium, or other publishing platforms, Expertene is built for creators who want to publish, earn, and grow their audience. Our content blocks are inspired by Notion's flexibility, but optimized for publishing and monetization.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                    <a href="https://notion.so" target="_blank" rel="noopener" className="underline text-secondary">Notion</a>
                    <a href="https://medium.com" target="_blank" rel="noopener" className="underline text-primary">Medium</a>
                    <a href="https://substack.com" target="_blank" rel="noopener" className="underline text-primary">Substack</a>
                  </div>
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
    </div>
  );
};

export default Index;