import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Link, Outlet } from 'react-router-dom';

export default function About(): JSX.Element {

  return (
    <div className="w-full px-6 py-12">
      <div className="mb-6">
        <BackButton />
      </div>

      <header className="mb-8 w-full">
        <h1 className="text-3xl font-bold mb-2">About Expertene</h1>
        <p className="text-lg text-muted-foreground">
          Expertene is a platform built for experts to share knowledge, publish technical
          content with rich code blocks, and build a following. We combine an editor-first
          publishing experience with powerful preview and collaboration features.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-4" style={{ scrollBehavior: 'smooth' }}>
        <article className="lg:col-span-3 space-y-6 max-w-full">
          {/* Render the chosen about subpage (overview is the index route) */}
          <Outlet />
        </article>

        <aside className="space-y-6">
          <nav className="sticky top-24 bg-card/40 backdrop-blur-md p-4 rounded border border-border">
            <h4 className="font-semibold mb-2">Sections</h4>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:underline" to="/about">Overview</Link></li>
              <li><Link className="hover:underline" to="/about/features">Key features</Link></li>
              <li><Link className="hover:underline" to="/about/quick-start">Quick start</Link></li>
              <li><Link className="hover:underline" to="/about/best-practices">Best practices</Link></li>
              <li><Link className="hover:underline" to="/about/faq">FAQ</Link></li>
              <li><Link className="hover:underline" to="/about/support">Support</Link></li>
              <li><Link className="hover:underline" to="/about/founding-team">Founding team</Link></li>
            </ul>
          </nav>

          <div className="bg-card border border-border rounded-lg p-6 shadow-soft" id="support">
            <h3 className="font-semibold mb-2">Want to get started?</h3>
            <p className="text-sm text-muted-foreground mb-4">Create content, share knowledge, and grow your audience.</p>
            <Button asChild>
              <Link to="/auth">Get started</Link>
            </Button>
          </div>

        </aside>
      </section>
    </div>
  );
}
