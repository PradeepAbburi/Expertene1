import { BackButton } from '@/components/BackButton';

export default function BestPractices(): JSX.Element {
  return (
    <div className="w-full px-6 py-12">
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-bold mb-4">Best practices</h1>

      <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>- Keep code examples focused and short. When showing long output, prefer collapsible previews so readers can expand if desired.</p>
          <p>- Use the code block label field to provide a friendly title (for example: "Example: Sorting with QuickSort") rather than showing only the language.</p>
          <p>- Mention other contributors with '@' so they are linked in previews and readers can discover profiles.</p>
        </div>
      </div>
    </div>
  );
}
