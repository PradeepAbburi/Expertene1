import "../styles/landing.css";
import useStreak from "../lib/useStreak";
import { useState } from 'react';
import StreakHistory from '@/components/StreakHistory';

export default function Landing() {
	const { streak } = useStreak();
	const [open, setOpen] = useState(false);

	return (
		<div className="lp-root">
			<header className="site-hero scattered-hero">
				{/* Top Left */}
				<div className="scattered scattered-topleft">
					<h1 className="brand">Expertene</h1>
					<div className="streak-badge">
						<span className="streak-label">Streak</span>
						<button className="streak-value" onClick={() => setOpen(true)}>{streak}</button>
					</div>
					<StreakHistory open={open} onOpenChange={setOpen} />
				</div>
				{/* Center */}
				<div className="scattered scattered-center">
					<h2 className="hero-title">Share knowledge.<br/>Build momentum.</h2>
					<p className="hero-sub">Publish articles, keep your daily streak, grow your audience.</p>
				</div>
				{/* Bottom Right */}
				<div className="scattered scattered-bottomright">
					<div className="hero-ctas">
						<a className="btn primary" href="/signup">Get started</a>
						<a className="btn ghost" href="#features">See features</a>
					</div>
				</div>
				{/* Visual Mock - Bottom Left */}
				<div className="scattered scattered-bottomleft" aria-hidden>
					<div className="card-mock">
						<div className="card-header">Latest article</div>
						<div className="card-body">Responsive article preview — replace with your content.</div>
					</div>
				</div>
			</header>

			<main>
				<section id="features" className="lp-section">
					<div className="site-inner">
						<h3 className="section-title">Features</h3>
						<div className="grid features-grid">
							<article className="feature">
								<h4>Daily streaks</h4>
								<p>Keep your streak by posting within 24 hours. Visual rewards and tracking.</p>
							</article>
							<article className="feature">
								<h4>Rich editor</h4>
								<p>Compose with formatting, embeds and images.</p>
							</article>
							<article className="feature">
								<h4>Community</h4>
								<p>Comments, reactions and discoverability to grow your audience.</p>
							</article>
						</div>
					</div>
				</section>

				<section className="lp-section lp-how">
					<div className="site-inner">
						<h3 className="section-title">How it works</h3>
						<ol className="how-list">
							<li><strong>Write</strong> — Draft an article in the editor.</li>
							<li><strong>Publish</strong> — Share to the feed.</li>
							<li><strong>Maintain streak</strong> — Post within 24 hours to keep it alive.</li>
						</ol>
					</div>
				</section>

				<section className="lp-section lp-testimonials">
					<div className="site-inner">
						<h3 className="section-title">What creators say</h3>
						<div className="grid testimonials-grid">
							<blockquote>“The streaks kept me consistent.”</blockquote>
							<blockquote>“Simple editor, great engagement.”</blockquote>
							<blockquote>“I found my audience here.”</blockquote>
						</div>
					</div>
				</section>

				<section className="lp-section lp-cta" id="signup">
					<div className="site-inner cta-inner">
						<div>
							<h3>Ready to publish?</h3>
							<p>Sign up and start your streak today.</p>
						</div>
						<div>
							<a className="btn primary large" href="/signup">Create account</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

