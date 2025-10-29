import { BackButton } from '@/components/BackButton';

export default function Features(): JSX.Element {
  return (
    <div className="w-full px-6 py-12">
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-bold mb-4">Key features</h1>

      <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>Rich WYSIWYG editor with code-block support, syntax highlighting and line numbers.</li>
          <li>Mention suggestions while writing and safe preview rendering of mentions and links.</li>
          <li>Centralized code preview that preserves tabs, shows line numbers, and supports collapsed/expanded views.</li>
          <li>Publish articles, comments, and community posts with moderation-friendly defaults.</li>
          <li>Responsive, accessible UI components and lightweight client powered by Vite + React.</li>
        </ul>
      </div>
    </div>
  );
}
