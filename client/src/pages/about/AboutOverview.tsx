export default function AboutOverview(): JSX.Element {
  return (
    <article className="lg:col-span-3 space-y-6 max-w-full">
      <div id="overview" className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h2 className="text-2xl font-semibold mb-3">What is Expertene?</h2>
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Expertene is an editor-first knowledge platform for technical creators. Our focus is on readable, reproducible technical content — from tutorials and deep dives to code samples and reproducible experiments.</p>
            <p className="text-sm text-muted-foreground mb-3">We surface clear, syntax-highlighted code previews, ensure mentions and links are safe in previews, and provide an audience-first reading experience that helps authors and readers connect.</p>
            <p className="text-sm text-muted-foreground">Use the sections on this page to learn more about the editor, code preview, community features, security and common use cases.</p>
          </div>
          <div className="rounded-md overflow-hidden bg-muted/10 flex items-center justify-center p-6">
            <img src="/assets/illustrations/platform-hero.png" alt="Expertene platform illustration" className="w-full h-auto max-h-48 object-contain" />
          </div>
        </div>
      </div>

      <div id="editor" className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h2 className="text-xl font-semibold mb-3">The editor</h2>
        <div className="md:flex md:items-center md:gap-6">
          <div className="md:flex-1">
            <p className="text-sm text-muted-foreground mb-2">Our editor is built for technical writing — fast keyboard shortcuts, paste-friendly code blocks, and an approachable WYSIWYG surface that keeps markup out of your way.</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Inline mentions with safe rendering in previews</li>
              <li>Code blocks with optional human-friendly labels</li>
              <li>Copy-to-clipboard and collapsed previews for long snippets</li>
            </ul>
          </div>
          <div className="mt-4 md:mt-0 md:w-48">
            <img src="/assets/illustrations/editor.png" alt="Editor screenshot illustration" className="w-full h-auto rounded-md shadow-sm" />
          </div>
        </div>
      </div>

      <div id="code-preview" className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h2 className="text-xl font-semibold mb-3">Code preview & syntax</h2>
        <div className="md:flex md:items-start md:gap-6">
          <div className="md:flex-1">
            <p className="text-sm text-muted-foreground mb-2">We render code with strong token colors, preserved tabs/spaces, and line numbers. Long code blocks are shown in a scrollable, collapsible container so articles stay readable.</p>
            <p className="text-sm text-muted-foreground">Each code block can optionally show a custom label instead of a language badge — useful for human-friendly descriptions (for example: "Example: API pagination").</p>
          </div>
          <div className="mt-4 md:mt-0 md:w-48">
            <img src="/assets/illustrations/preview.png" alt="Code preview illustration" className="w-full h-auto rounded-md shadow-sm" />
          </div>
        </div>
      </div>

      <div id="community" className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h2 className="text-xl font-semibold mb-3">Community & discovery</h2>
        <p className="text-sm text-muted-foreground">Readers can follow authors, comment on posts, and bookmark useful articles. Discoverability is optimized for technical content: tags, author profiles, and safe mention links help readers find experts quickly.</p>
        <div className="mt-4 rounded-md overflow-hidden bg-muted/10 p-4">
          <img src="/assets/illustrations/community.png" alt="Community illustration" className="w-full h-auto rounded-md" />
        </div>
      </div>

      <div id="security" className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h2 className="text-xl font-semibold mb-3">Privacy & security</h2>
        <p className="text-sm text-muted-foreground">We prioritize safe rendering: external links open in new tabs, mentions are sanitized to avoid XSS, and server-side checks prevent unsafe content in previews. For integrations, we offer scoped API access and role-based controls.</p>
      </div>

      <div id="use-cases" className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h2 className="text-xl font-semibold mb-3">Use cases</h2>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>Tutorials and walkthroughs with runnable code snippets.</li>
          <li>API reference articles with short examples and collapsible output.</li>
          <li>Opinion pieces or deep dives augmented with technical samples.</li>
        </ul>
      </div>
    </article>
  );
}
