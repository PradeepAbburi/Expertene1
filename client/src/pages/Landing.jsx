
import React from 'react';
import './landing.css';
import { Navigation } from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export default function Landing() {
  return (
    <div className="lp-root">
      <Navigation />
      <header className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-copy">
            <h1>Expertene — Share, Learn, Grow</h1>
            <p>Publish articles, build streaks, and connect with a community of experts.</p>
            <div className="lp-cta-row">
              <a className="btn primary" href="#signup">Get started</a>
              <a className="btn ghost" href="#features">Explore features</a>
            </div>
          </div>
          <div className="lp-hero-visual" aria-hidden="true">
            <div className="lp-card-mock">
              <div className="lp-card-header">Your latest article</div>
              <div className="lp-card-body">A short preview of article content — responsive mockup.</div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="lp-section lp-features" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>Features that empower creators</h2>
        <div className="lp-grid lp-grid-3">
          <article className="lp-feature">
            <h3>Daily streaks</h3>
            <p>Keep your streak by posting every 24 hours. Visual reward and tracking.</p>
          </article>
          <article className="lp-feature">
            <h3>Rich editor</h3>
            <p>Write with ease — format, embed, and publish in seconds.</p>
          </article>
          <article className="lp-feature">
            <h3>Community feedback</h3>
            <p>Get comments, reactions, and grow your audience.</p>
          </article>
        </div>
      </section>

  <section className="lp-section lp-how" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>How it works</h2>
        <ol className="lp-steps">
          <li><strong>Write</strong> — Create an article in the editor.</li>
          <li><strong>Publish</strong> — Share it with the community.</li>
          <li><strong>Maintain streak</strong> — Post within 24 hours to keep streak alive.</li>
        </ol>
      </section>

  <section className="lp-section lp-testimonials" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>What creators say</h2>
        <div className="lp-grid lp-grid-3">
          <blockquote className="lp-testimonial">"I doubled my followers in a month."</blockquote>
          <blockquote className="lp-testimonial">"Streaks kept me consistent and motivated."</blockquote>
          <blockquote className="lp-testimonial">"Great editor and community feedback."</blockquote>
        </div>
      </section>

      {/* New Section: Pricing/Plans */}
  <section className="lp-section lp-pricing" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>Pricing & Plans</h2>
        <div className="lp-grid lp-grid-3">
          <div className="lp-pricing-card">
            <h3>Free</h3>
            <p>Access all basic features, join the community, and start publishing.</p>
            <div className="lp-price">₹0/month</div>
          </div>
          <div className="lp-pricing-card">
            <h3>Pro</h3>
            <p>Advanced analytics, integrations, and priority support.</p>
            <div className="lp-price">₹299/month</div>
          </div>
          <div className="lp-pricing-card">
            <h3>Creator</h3>
            <p>Monetize your content, exclusive creator tools, and more.</p>
            <div className="lp-price">₹999/month</div>
          </div>
        </div>
      </section>

      {/* New Section: FAQ */}
  <section className="lp-section lp-faq" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>Frequently Asked Questions</h2>
        <div className="lp-faq-list">
          <div className="lp-faq-item">
            <h4>How do I start a streak?</h4>
            <p>Publish an article every 24 hours to keep your streak alive.</p>
          </div>
          <div className="lp-faq-item">
            <h4>Can I monetize my content?</h4>
            <p>Yes, upgrade to Creator to unlock monetization features.</p>
          </div>
          <div className="lp-faq-item">
            <h4>Is there a free plan?</h4>
            <p>Yes, you can use all basic features for free.</p>
          </div>
        </div>
      </section>

      {/* New Section: Team/About */}
  <section className="lp-section lp-team" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>Meet the Team</h2>
        <div className="lp-grid lp-grid-3">
          <div className="lp-team-card">
            <h4>Dinesh Kumar</h4>
            <p>Founder & Lead Developer</p>
          </div>
          <div className="lp-team-card">
            <h4>Jay Krishna</h4>
            <p>Community Manager</p>
          </div>
          <div className="lp-team-card">
            <h4>Expert Contributors</h4>
            <p>Our growing community of experts.</p>
          </div>
        </div>
      </section>

      {/* New Section: Contact */}
  <section className="lp-section lp-contact" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>Contact Us</h2>
        <p>Email: <a href="mailto:support@expertene.com">support@expertene.com</a></p>
        <p>Address: [Your Company Address, City, State, India]</p>
      </section>

      {/* New Section: Integrations/Partners */}
  <section className="lp-section lp-integrations" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>Integrations & Partners</h2>
        <div className="lp-grid lp-grid-3">
          <div className="lp-integration-card">Stripe</div>
          <div className="lp-integration-card">GitHub</div>
          <div className="lp-integration-card">Google Drive</div>
          <div className="lp-integration-card">Slack</div>
          <div className="lp-integration-card">Zapier</div>
          <div className="lp-integration-card">Custom Webhooks</div>
        </div>
      </section>

      {/* New Section: Recent Articles/Trending */}
  <section className="lp-section lp-recent-articles" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <h2>Recent Articles</h2>
        <div className="lp-articles-list">
          {/* You can fetch and map recent articles here, or link to Explore/Feed */}
          <p>Check out the <a href="/explore">Explore</a> page for the latest articles.</p>
        </div>
      </section>

  <section id="signup" className="lp-section lp-cta" style={{width:'100vw',marginLeft:'calc(-50vw + 50%)'}}>
        <div className="lp-cta-inner">
          <div>
            <h2>Ready to publish?</h2>
            <p>Create an account and start your streak today.</p>
          </div>
          <div>
            <a className="btn primary large" href="/signup">Create account</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
