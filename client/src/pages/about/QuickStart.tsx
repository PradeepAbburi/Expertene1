import { BackButton } from '@/components/BackButton';

export default function QuickStart(): JSX.Element {
  return (
    <div className="w-full px-6 py-12">
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-bold mb-4">Quick start</h1>

      <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground">
          <li>Create an account or sign in. Your profile will be visible when you mention others and in post bylines.</li>
          <li>Click "Create" to open the editor. Use the code-block component to paste or write code snippets. Add a custom label if you want a human-friendly name instead of a language badge.</li>
          <li>While typing '@' you will see profile suggestions. Select one to insert a safe mention link that appears in the preview.</li>
          <li>Use the preview to verify how code blocks render (line numbers, token colors) and that mentions/links render correctly.</li>
          <li>Publish your article and share — readers can comment, bookmark, and follow you.</li>
        </ol>
      </div>
    </div>
  );
}
